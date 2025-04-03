on run
tell application "Finder"
	-- 检查 Spyder 是否已运行
	if application "Spyder" is running then
		activate application "Spyder"
		delay 0.5 -- 等待窗口激活
		
		-- 发送 Cmd+V 粘贴操作
		tell application "System Events"
			keystroke "v" using command down
			delay 0.2 -- 确保粘贴完成
			key code 36 -- 发送回车键（key code 36 = Enter）
		end tell
	else
		-- Spyder 未运行的启动逻辑（保留原有代码）
		try
			activate application "Spyder"
		on error
			set spyderPath to (POSIX file "/Applications/Spyder.app") as alias
			tell application spyderPath to launch
		end try
	end if
end tell
end run