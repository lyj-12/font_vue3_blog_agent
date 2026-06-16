@echo off
chcp 65001 >nul

echo ========================================
echo Git Auto Push
echo ========================================

echo.
set /p COMMIT_MSG=Please enter commit message: 

:: 检查用户是否输入了内容，如果为空则退出
if "%COMMIT_MSG%"=="" (
    echo Error: Commit message cannot be empty!
    pause
    exit /b 1
)

echo.
echo Commit Message: %COMMIT_MSG%
echo.

echo [1/3] git add .
git add .

echo.
echo [2/3] git commit
git commit -m "%COMMIT_MSG%"

echo.
echo [3/3] git push
git push

echo.
echo ========================================
echo Push Finished
echo ========================================
pause