; AutoHotkey v1.0 script to send code to Spyder
; Parameter: 1=exePath (optional)

; Get command line parameter (optional)
SpyderPath = %1%

; If path provided, verify it
if (SpyderPath != "")
{
    ; Check if path exists
    IfNotExist, %SpyderPath%
    {
        MsgBox, 16, Error, Spyder executable path does not exist!
        ExitApp
    }
    
    ; Check if path points to Spyder executable
    SplitPath, SpyderPath, filename
    if (!InStr(filename, "spyder") && !InStr(filename, "python"))
    {
        MsgBox, 16, Error, Path does not appear to be a Spyder executable!
        ExitApp
    }
}

; Set window title to Spyder
SpyderWin := "Spyder"

; Set fixed delays (milliseconds)
SetWinDelay, 200
SetKeyDelay, 10

; Check if Spyder is already open
IfWinExist, %SpyderWin%
{
    WinActivate
    WinWaitActive
    ; Run selected code
    Sleep, 300
    ; Paste code and run it
    Send, ^v
    Sleep, 200
    Send, {enter}
}
Else
{
    ; Launch Spyder based on whether path was provided
    if (SpyderPath != "")
        Run, %SpyderPath%
    else
        Run, spyder
        
    ; Wait for Spyder to open
    WinWaitActive, %SpyderWin%, , 10
    if ErrorLevel
    {
        MsgBox, 16, Error, Spyder failed to start!
        ExitApp
    }
    
    Sleep, 1000
     MsgBox, Move cursor to IPython Console!
}

; End of script