@echo off
rem Abre o empacotador com janela (ferramentas\empacotador_janela.py) usando o Python instalado.
rem Nao e um executavel, entao o antivirus nao tem o que bloquear.
cd /d "%~dp0"
where pyw >nul 2>nul && (start "" pyw -3 "ferramentas\empacotador_janela.py" & exit /b)
where pythonw >nul 2>nul && (start "" pythonw "ferramentas\empacotador_janela.py" & exit /b)
where py >nul 2>nul && (py -3 "ferramentas\empacotador_janela.py" & exit /b)
where python >nul 2>nul && (python "ferramentas\empacotador_janela.py" & exit /b)
echo.
echo  O Python nao esta instalado neste computador.
echo  Instale o Python 3 (python.org ou Microsoft Store) e abra este arquivo de novo.
echo  Na instalacao, marque "Add python.exe to PATH".
echo.
start "" "https://www.python.org/downloads/windows/"
pause
