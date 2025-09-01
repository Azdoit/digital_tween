import axios from 'axios' 

// 创建axios实例（你现有的）
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // 后端API地址（有 /api 前缀的情况）
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ✅ 新增：图片问答后端实例（指向 8000 端口根路径，便于无 /api 前缀时调用）
const imageAPI = axios.create({
  baseURL: 'http://localhost:8000', // 没有强加 /api，便于做路径回退
  timeout: 600000,
  headers: { 'Content-Type': 'application/json' }
})

// 创建专门用于sailisi服务的API实例（你现有的）
const sailisiAPI = axios.create({
  baseURL: 'http://localhost:83/api',
  timeout: 600000,
  headers: { 'Content-Type': 'application/json' }
});

// ------- 日志拦截（你现有的） -------
sailisiAPI.interceptors.request.use(
  (config) => {
    console.log('🚀 Sailisi API 请求:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('❌ Sailisi API 请求错误:', error);
    return Promise.reject(error);
  }
);

sailisiAPI.interceptors.response.use(
  (response) => {
    console.log('✅ Sailisi API 响应成功:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('❌ Sailisi API 响应错误:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// 通用实例的拦截器（你现有的）
api.interceptors.request.use(
  config => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    console.log('收到响应:', response.status, response.config.url)
    return response.data
  },
  error => {
    console.error('响应错误:', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

// ================== 业务 API ==================
export const dashboardAPI = {
  getStats() { return api.get('/dashboard/stats') },
  getDevices() { return api.get('/devices') },
  getDevice(id) { return api.get(`/devices/${id}`) }
}

export const qaAPI = {
  // 智能问答聊天（你现有的）
  chat(message) {
    return api.post('/qa/chat', message)
  },

  // ✅ 新增：图片问答 —— 调用你本机 8000 端口的 pic_qwen_V 后端
  // 会优先尝试 /api/ask，若 404 则回退到 /ask
  async imageChat(message, opts = {}) {
    const questionText = typeof message === 'string' ? message : (message?.text ?? '')
    if (!questionText) throw new Error('问题内容为空')

    // 可选参数（与后端 /ask 的字段对齐；没有就使用后端默认值）
    const payload = {
      question: questionText,
      k: opts.k ?? 1,
      // 以下可选：与后端一致时再传
      persist_dir: opts.persist_dir,           // e.g. 'D:/chroma_data'
      collection_text: opts.collection_text,   // e.g. 'text_vec'
      st_model: opts.st_model,                 // e.g. 'BAAI/bge-m3'
      model: opts.model,                       // e.g. 'Qwen/Qwen2-VL-72B-Instruct'
      base_url: opts.base_url,                 // e.g. 'https://api.siliconflow.cn/v1'
      api_key: opts.api_key                    // e.g. 从 .env 读
    }

    // 清理 undefined 字段，避免影响后端默认值
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

    try {
      // ① 尝试 /api/ask
      const r1 = await imageAPI.post('/api/ask', payload)
      return r1.data ?? r1
    } catch (e) {
      if (e?.response?.status === 404) {
        console.warn('[imageChat] /api/ask 不存在，尝试 /ask 回退')
        // ② 回退 /ask
        const r2 = await imageAPI.post('/ask', payload)
        return r2.data ?? r2
      }
      // 其它错误向上抛
      throw e
    }
  },

  // 赛力斯智能问答（你现有的）
  async sailisiChat(message) {
    console.log('🚀 sailisiChat调用参数:', message)
    try {
      const questionText = typeof message === 'string' ? message : message.text
      console.log('📝 提取的问题文本:', questionText)
      const response = await fetch('http://localhost:83/api/knowledge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: questionText })
      })
      if (!response.ok) { throw new Error(`HTTP ${response.status}: ${response.statusText}`) }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let finalAnswer = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5))
              if (data.content && data.content.stage === 'llm_processing') {
                finalAnswer += data.content.message || ''
              }
              if (data.content && data.content.stage === 'complete') {
                console.log('✅ 赛力斯流式响应完成')
                return { answer: finalAnswer }
              }
            } catch (e) {
              console.log('解析SSE数据失败:', e)
            }
          }
        }
      }
      return { answer: finalAnswer || '赛力斯服务响应完成，但未收到内容' }
    } catch (error) {
      console.error('赛力斯问答执行失败:', error)
      throw error
    }
  },

  sailisiAsk(question) { return sailisiAPI.post('/knowledge', { query: question }) },

  async sailisiRefresh() {
    try {
      const response = await fetch('http://localhost:83/api/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('刷新赛力斯历史失败:', error)
      throw error
    }
  },

  async sailisiHealth() {
    try {
      const response = await fetch('http://localhost:83/api/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      if (response.ok) {
        return { status: 'healthy', message: '赛力斯服务连接正常' }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      return { status: 'unhealthy', error: error.message, message: '赛力斯服务连接失败' }
    }
  },

  // CSV
  async csvChat(message) {
    console.log('🚀 csvChat调用参数:', message)
    try {
      const questionText = typeof message === 'string' ? message : message.text
      const response = await fetch('http://localhost:5001/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText })
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const data = await response.json()
      if (data.status === 'error') throw new Error(data.error || data.message)
      return { text: data.answer }
    } catch (error) {
      console.error('CSV问答执行失败:', error)
      throw error
    }
  },

  async csvHealth() {
    try {
      const response = await fetch('http://localhost:5001/health', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const data = await response.json()
      return data
    } catch (error) {
      return { status: 'unhealthy', error: error.message, message: 'CSV问答服务连接失败' }
    }
  },

  // Graph
  async graphChat(message) {
    console.log('🚀 graphChat调用参数:', message)
    try {
      const questionText = typeof message === 'string' ? message : message.text
      const response = await fetch('http://localhost:5002/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText })
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const data = await response.json()
      if (data.status === 'error') throw new Error(data.error || data.message)
      return { text: data.answer }
    } catch (error) {
      console.error('Graph问答执行失败:', error)
      throw error
    }
  },

  async graphHealth() {
    try {
      const response = await fetch('http://localhost:5002/health', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const data = await response.json()
      return data
    } catch (error) {
      return { status: 'unhealthy', error: error.message, message: 'Graph问答服务连接失败' }
    }
  },

  async getGraphSchema() {
    try {
      const response = await fetch('http://localhost:5002/schema', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('获取Graph Schema失败:', error)
      throw error
    }
  }
}

export const monitorAPI = {
  getCameras() { return api.get('/monitor/cameras') }
}

export const analyticsAPI = {
  getEnergyData() { return api.get('/analytics/energy') },
  getProductionData() { return api.get('/analytics/production') }
}

export const systemAPI = {
  healthCheck() { return api.get('/health') }
}

// ================== 三维模型生成 API ==================
// 创建专门用于3D生成服务的API实例
const ai3dClient = axios.create({
  baseURL: 'http://localhost:3002',
  timeout: 600000,
  headers: { 'Content-Type': 'application/json' }
})

export const ai3dAPI = {
  // 提交文生3D任务
  submitTextTo3D(prompt, resultFormat = 'GLB', enablePBR = false) {
    return ai3dClient.post('/api/ai3d/submit', {
      prompt: prompt,
      resultFormat: resultFormat,
      enablePBR: enablePBR
    })
  },

  // 提交图生3D任务（表单上传）
  submitImageTo3D(formData) {
    return ai3dClient.post('/api/ai3d/submit-form', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 查询任务状态
  queryStatus(jobId) {
    return ai3dClient.get(`/api/ai3d/status?jobId=${jobId}`)
  },

  // 保存结果到本地
  saveToLocal(jobId, url) {
    return ai3dClient.get(`/api/ai3d/save?jobId=${jobId}&url=${encodeURIComponent(url)}`)
  },

  // 健康检查
  healthCheck() {
    return ai3dClient.get('/api/ai3d/health')
  }
}

export default api
