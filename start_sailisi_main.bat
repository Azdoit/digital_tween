@echo off
echo Starting Sailisi Comprehensive QA Server...
echo 正在启动赛力斯综合问答服务器...

cd /d "D:\code\DT_project\DT_project\sailisi"

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

pip install flask flask-cors langchain-openai langchain-core langchain neo4j

echo Starting Sailisi Comprehensive QA Server on port 83...
echo 在端口83启动赛力斯综合问答服务器...
echo.
echo This service integrates:
echo 此服务集成了：
echo - RAG Document Retrieval / RAG文档检索
echo - Knowledge Graph QA / 知识图谱问答  
echo - CSV Data Analysis / CSV数据分析
echo - LLM Response Generation / 大模型回答生成
echo.

python main.py

pause









