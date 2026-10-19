@echo off
cd /d "%~dp0"

echo Pulling latest from origin...
git pull origin main

echo.
echo Staging all changes...
git add -A

echo.
set /p MSG="Commit message: "
git commit -m "%MSG%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Done.
pause
