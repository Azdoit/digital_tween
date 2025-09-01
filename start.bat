@echo off
echo 启动数字孪生平台...
echo.

echo 正在启动后端服务器...
start "后端服务器" cmd /k "cd backend && python main.py"

echo 等待后端启动...
timeout /t 3 /nobreak > nul

echo 正在启动前端服务器...
start "前端服务器" cmd /k "npm run dev"

echo.
echo 服务器启动完成！
echo 前端地址: http://localhost:3000
echo 后端API: http://localhost:8000
echo API文档: http://localhost:8000/docs
echo.
pause
