@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title 吉韵禾野 · 乡村振兴双端协同数字平台 一键启动

cd /d "%~dp0"

echo.
echo ================================================================
echo    《吉韵禾野》乡村振兴双端协同数字平台 · 一键启动器
echo    支持离线极速预览（免安装依赖）及源码热更新开发模式
echo ================================================================
echo.

if /I "%~1"=="dev" goto :DEV_MODE

:: 优先使用已预构建的 dist/（1 秒即开，无需老师手动 npm install）
if exist "dist\index.html" (
    where node >nul 2>nul
    if !errorlevel! equ 0 (
        echo [模式] 检测到 Node.js 与预构建包 dist\，正在极速启动本地服务...
        node "scripts\serve_dist.mjs"
        goto :END
    )

    where python >nul 2>nul
    if !errorlevel! equ 0 (
        echo [模式] 检测到 Python 与预构建包 dist\，正在极速启动本地服务...
        python "scripts\serve_dist.py"
        goto :END
    )
)

:DEV_MODE
where node >nul 2>nul
if !errorlevel! neq 0 (
    echo [提示] 本机未检测到 Node.js 或 Python 运行环境。
    echo.
    echo 您可以选择以下任一方式直接体验本作品：
    echo   方式一：安装 Node.js ^(https://nodejs.org/^) 后重新双击本脚本；
    echo   方式二：直接在浏览器访问线上云端部署版：
    echo           https://klb299.github.io/jiyun-rural-revitalization/
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [安装] 首次以源码模式运行，正在安装前端依赖 ^(npm install^)...
    call npm.cmd install
    if !errorlevel! neq 0 (
        echo [错误] 依赖安装失败，请检查网络连接后重试。
        pause
        exit /b 1
    )
)

echo [模式] 正在启动 Vite 源码热更新开发服务器...
call npm.cmd run dev -- --host 127.0.0.1 --port 5173 --open

:END
echo.
pause
