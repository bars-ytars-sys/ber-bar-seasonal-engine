@echo off
rem Gasit ekran (monitor v son). Probudit - dvizhenie myshi ili klavisha.
timeout /t 1 >nul
powershell -NoProfile -Command "(Add-Type -MemberDefinition '[DllImport(\"user32.dll\")] public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name Mon -Namespace Win32 -PassThru)::SendMessage(-1, 0x0112, 0xF170, 2)" >nul
