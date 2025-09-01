import requests
import json

url = "http://localhost:83/api/knowledge"
data = {"query": "供应商有哪些？"}

try:
    response = requests.post(url, json=data, timeout=10)
    print(f"状态码: {response.status_code}")
    result = response.json()
    print(f"完整响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"请求失败: {e}")

# 也测试一下健康检查
try:
    health_response = requests.get("http://localhost:83/api/health")
    print(f"\n健康检查: {health_response.json()}")
except Exception as e:
    print(f"健康检查失败: {e}")



