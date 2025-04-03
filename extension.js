const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 本地化错误消息
const messages = {
    success: '代码已成功发送到Spyder',
    clipboardError: '复制到剪贴板失败',
    scriptError: '脚本执行失败',
    timeoutError: '脚本执行超时',
    invalidPath: '无效的脚本路径',
    unsupportedPlatform: '不支持的操作系统'
};

async function executeCommand(editor, rangeType) {
    if (!editor) return;
    
    const range = getDocumentRange(editor, rangeType);
    const text = editor.document.getText(range);
    
    try {
        await sendTospyder(text, vscode.workspace.getConfiguration('SpyderRunner').get('spyderPath'));
        vscode.window.showInformationMessage(messages.success);
    } catch (error) {
        vscode.window.showErrorMessage(`${messages.scriptError}: ${error.message}`);
    }
}

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('spyder-runner.runSelection', () => executeCommand(vscode.window.activeTextEditor, 'selection')),
        vscode.commands.registerCommand('spyder-runner.runToCursor', () => executeCommand(vscode.window.activeTextEditor, 'toCursor')),
        vscode.commands.registerCommand('spyder-runner.runFromCursorToEnd', () => executeCommand(vscode.window.activeTextEditor, 'fromCursor'))
    );
}

async function sendTospyder(code, spyderPath) {
    return new Promise((resolve, reject) => {
        // 将代码复制到剪贴板（带重试逻辑）
        const copyWithRetry = async (attempt = 1) => {
            try {
                await vscode.env.clipboard.writeText(code);
            } catch (err) {
                if (attempt < 3) {
                    await new Promise(res => setTimeout(res, 200));
                    return copyWithRetry(attempt + 1);
                }
                reject(new Error(`${messages.clipboardError}: ${err.message}`));
                return;
            }
            
            try {
                await executeScript(spyderPath);
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        
        copyWithRetry();
    });
}

async function executeScript(spyderPath) {
    return new Promise((resolve, reject) => {
        let scriptPath;
        let command;
        
        if (process.platform === 'win32') {
            scriptPath = path.join(vscode.extensions.getExtension('kerrydu.spyder-runner').extensionPath, 'send_to_spyder.exe');
            
            // 验证Windows平台下的Spyder路径
            if (spyderPath && !fs.existsSync(spyderPath)) {
                reject(new Error(messages.invalidPath));
                return;
            }
            
            command = spyderPath ? `"${scriptPath}" "${spyderPath}"` : `"${scriptPath}"`;
        } else if (process.platform === 'darwin') {
            scriptPath = path.join(vscode.extensions.getExtension('kerrydu.spyder-runner').extensionPath, 'send_to_spyder.scpt');
            command = `osascript "${scriptPath}"`;
        } else {
            reject(new Error(messages.unsupportedPlatform));
            return;
        }
        
        // 验证脚本路径
        if (!fs.existsSync(scriptPath)) {
            reject(new Error(messages.invalidPath));
            return;
        }
        
        // 脚本执行带重试逻辑
        const maxRetries = 3;
        let retryCount = 0;
        
        const executeWithRetry = () => {
            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
                if (error) {
                    if (error.code === 'ETIMEDOUT') {
                        reject(new Error(messages.timeoutError));
                    } else if (retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(executeWithRetry, 500);
                    } else {
                        reject(new Error(`${messages.scriptError}: ${error.message}`));
                    }
                } else if (stderr) {
                    reject(new Error(`${messages.scriptError}: ${stderr}`));
                } else {
                    resolve();
                }
            });
        };
        
        executeWithRetry();
    });
}

function getDocumentRange(editor, type) {
    const document = editor.document;
    const cursorPos = editor.selection.active;
    
    switch(type) {
        case 'selection':
            return editor.selection.isEmpty 
                ? document.lineAt(cursorPos.line).range 
                : editor.selection;
        case 'toCursor':
            return new vscode.Range(
                new vscode.Position(0, 0),
                cursorPos
            );
        case 'fromCursor':
            return new vscode.Range(
                cursorPos,
                document.lineAt(document.lineCount - 1).range.end
            );
    }
}

module.exports = {
    activate
};