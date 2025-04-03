on run
    tell application "System Events"
        -- 检查Spyder是否已运行
        set isSpyderRunning to exists (processes where name is "Spyder")
        
        if isSpyderRunning then
            -- 激活Spyder
            tell application "Spyder 6" to activate
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
            -- 提示用户手动打开Spyder
            display dialog "请手动打开Spyder 6" 
        end if
    end tell
end run