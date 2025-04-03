on run
    tell application "System Events"
        -- 检查Spyder是否已运行
        set isSpyderRunning to exists (processes where name is "Spyder")
        
        if isSpyderRunning then
            -- 激活Spyder
            tell application "Spyder" to activate
            delay 0.5
            -- 粘贴代码
            set retryCount to 0
            repeat while retryCount < 3
                try
                    keystroke "v" using command down
                    delay 0.2
                    keystroke return
                    exit repeat
                on error
                    set retryCount to retryCount + 1
                    delay 0.5
                end try
            end repeat
        else
            -- 启动Spyder
            tell application "Spyder" to activate
            
            -- 等待Spyder启动
            set timeoutSeconds to 10
            set startTime to current date
            repeat
                if (current date) - startTime > timeoutSeconds then
                    display dialog "Spyder failed to start within " & timeout & " seconds!" with icon stop buttons {"OK"}
                    error number -128
                end if
                
                try
                    if exists (processes where name is "Spyder") then exit repeat
                end try
                delay 1
            end repeat
            
            delay 1
            display dialog "Move cursor to IPython Console!" buttons {"OK"}
            
            -- 粘贴代码
            set retryCount to 0
            repeat while retryCount < 3
                try
                    keystroke "v" using command down
                    delay 0.2
                    keystroke return
                    exit repeat
                on error
                    set retryCount to retryCount + 1
                    delay 0.5
                end try
            end repeat
        end if
    end tell
end run