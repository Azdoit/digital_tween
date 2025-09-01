import requests
import json

def test_sailisi_api():
    base_url = "http://localhost:83/api"
    
    print("🧪 测试Sailisi API连接")
    print("=" * 40)
    
    # 1. 测试健康检查
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"✅ 健康检查: {response.status_code}")
        print(f"   响应: {response.json()}")
    except Exception as e:
        print(f"❌ 健康检查失败: {e}")
        return False
    
    # 2. 测试知识问答
    try:
        test_data = {"query": "你好，请介绍一下自己"}
        response = requests.post(f"{base_url}/knowledge", json=test_data, timeout=10)
        print(f"✅ 问答测试: {response.status_code}")
        result = response.json()
        print(f"   问题: {result.get('query', 'N/A')}")
        print(f"   回答: {result.get('answer', 'N/A')[:100]}...")
    except Exception as e:
        print(f"❌ 问答测试失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_sailisi_api()
    print("=" * 40)
    print(f"🎯 测试结果: {'成功' if success else '失败'}")


