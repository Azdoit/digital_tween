@echo off
echo Starting Graph Knowledge QA Server...
echo 正在启动Graph知识图谱问答服务器...

cd /d "G:\working_project\DT_project\sailisi"

echo Checking Python environment...
echo 检查Python环境...

python --version
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH!
    echo Python未安装或未添加到PATH环境变量！
    pause
    exit /b 1
)

echo Installing required packages...
echo 安装所需的Python包...

pip install flask flask-cors langchain-openai neo4j

echo Starting Graph QA Server on port 5002...
echo 在端口5002启动Graph问答服务器...

python graph_qa_server.py

pause









