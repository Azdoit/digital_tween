import requests
import json

def test_smart_qa():
    base_url = "http://localhost:83/api"
    
    print("🧪 测试智能问答服务")
    print("=" * 50)
    
    # 1. 测试健康检查
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"✅ 健康检查: {response.status_code}")
        result = response.json()
        print(f"   AI状态: {'启用' if result.get('ai_enabled') else '未启用'}")
        print(f"   消息: {result.get('message')}")
    except Exception as e:
        print(f"❌ 健康检查失败: {e}")
        return False
    
    # 2. 测试知识库问答
    test_questions = [
        "供应商有哪些？",
        "设备故障如何处理？", 
        "如何提高生产效率？"
    ]
    
    for i, question in enumerate(test_questions, 1):
        try:
            test_data = {"query": question}
            response = requests.post(f"{base_url}/knowledge", json=test_data, timeout=15)
            print(f"\n📝 测试 {i}: {response.status_code}")
            result = response.json()
            print(f"   问题: {result.get('query', 'N/A')}")
            answer = result.get('answer', 'N/A')
            print(f"   回答: {answer[:150]}{'...' if len(answer) > 150 else ''}")
        except Exception as e:
            print(f"❌ 问答测试 {i} 失败: {e}")
    
    return True

if __name__ == "__main__":
    test_smart_qa()
    print("\n" + "=" * 50)
    print("🎯 测试完成！现在可以在前端试试智能问答了！")


