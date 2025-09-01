<template>
  <div class="qa-page">
    <div class="qa-container">
      <div class="qa-header">
        <h2><icon-message /> 智能问答系统</h2>
        <p>基于AI的工厂智能问答助手，为您解答生产相关问题</p>
        <div class="qa-mode-selector">
          <a-radio-group v-model="qaMode" size="small">
            <a-radio value="sailisi">赛力斯智能问答</a-radio>
            <a-radio value="graph">Graph数据问答</a-radio>
            <a-radio value="csv">CSV数据问答</a-radio>
            <!-- ✅ 新增：图片问答 -->
            <a-radio value="image">图片问答</a-radio>
          </a-radio-group>

          <a-button 
            v-if="qaMode === 'sailisi'" 
            type="text" 
            size="small"
            @click="checkSailisiHealth"
            :loading="sailisiHealthChecking"
          >
            <icon-check-circle /> 检查连接
          </a-button>
          <a-button 
            v-if="qaMode === 'sailisi'" 
            type="text" 
            size="small"
            @click="clearSailisiHistory"
            :loading="clearingHistory"
          >
            <icon-delete /> 清除历史
          </a-button>
          <a-button 
            v-if="qaMode === 'graph'" 
            type="text" 
            size="small"
            @click="checkGraphHealth"
            :loading="graphHealthChecking"
          >
            <icon-check-circle /> 检查连接
          </a-button>
          <a-button 
            v-if="qaMode === 'csv'" 
            type="text" 
            size="small"
            @click="checkCSVHealth"
            :loading="csvHealthChecking"
          >
            <icon-check-circle /> 检查CSV连接
          </a-button>
        </div>
      </div>
      
      <div class="qa-content">
        <div class="chat-container">
          <div class="chat-messages" ref="messagesContainer">
            <div 
              v-for="message in messages" 
              :key="message.id"
              class="message"
              :class="message.type"
            >
              <div class="message-avatar">
                <icon-user v-if="message.type === 'user'" />
                <icon-robot v-else />
              </div>
              <div class="message-content">
                <div class="message-text">
                  {{ message.text || (message.isTyping && !message.text ? 'AI正在思考中...' : '') }}<span v-if="message.isTyping" class="typing-cursor">|</span>
                </div>

                <!-- ✅ 展示命中的相关图片（仅在有图片时显示） -->
                <div v-if="message.images?.length" class="message-images">
                  <img
                    v-for="(img, idx) in message.images"
                    :key="idx"
                    :src="img"
                    class="chat-image"
                    loading="lazy"
                    alt="相关图片"
                    @click="openImagePreview(img, message.text)"
                  />
                </div>

                <div class="message-time">{{ message.time }}</div>
              </div>
            </div>
          </div>
          
          <div class="chat-input">
            <a-input-group compact>
              <a-input
                v-model="inputMessage"
                placeholder="请输入您的问题..."
                size="large"
                @keyup.enter="() => sendMessage(inputMessage)"
              />
              <a-button 
                type="primary" 
                size="large"
                @click="() => sendMessage(inputMessage)"
                :loading="loading"
              >
                <template #icon><icon-send /></template>
                发送
              </a-button>
            </a-input-group>
          </div>
        </div>
        
        <div class="qa-sidebar">
          <div class="quick-questions">
            <h3>常见问题</h3>
            <div class="question-list">
              <a-button
                v-for="question in quickQuestions"
                :key="question.id"
                type="text"
                class="quick-question-btn"
                @click="askQuickQuestion(question.text)"
              >
                {{ question.text }}
              </a-button>
            </div>
          </div>
          
          <div class="qa-stats">
            <h3>问答统计</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalQuestions }}</div>
                <div class="stat-label">总问题数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.accuracy }}%</div>
                <div class="stat-label">准确率</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.responseTime }}s</div>
                <div class="stat-label">平均响应</div>
              </div>
            </div>
          </div>
        </div>
      </div> <!-- qa-content -->
    </div>

    <!-- ✅ 新增：图片预览弹窗 -->
    <a-modal
      v-model:visible="preview.visible"
      :footer="false"
      :width="900"
      :mask-closable="true"
      :title="preview.title || '查看图片'"
      class="img-preview-modal"
    >
      <div class="preview-toolbar">
        <a-button size="small" @click="zoom(-0.2)">缩小</a-button>
        <a-button size="small" @click="zoom(0.2)">放大</a-button>
        <a-button size="small" @click="rotate(-90)">左转90°</a-button>
        <a-button size="small" @click="rotate(90)">右转90°</a-button>
        <a-button size="small" @click="resetPreview">重置</a-button>
      </div>
      <div class="preview-stage">
        <img
          v-if="preview.src"
          :src="preview.src"
          :style="{ transform: `scale(${preview.scale}) rotate(${preview.rotate}deg)` }"
          class="preview-img"
          alt="preview"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { qaAPI } from '@/utils/api'

const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || 'http://127.0.0.1:8000' // 用于拼接 /static 图片

const messagesContainer = ref(null)
const inputMessage = ref('')
const loading = ref(false)
const qaMode = ref('sailisi') // sailisi / graph / csv / image
const sailisiHealthChecking = ref(false)
const graphHealthChecking = ref(false)
const csvHealthChecking = ref(false)
const clearingHistory = ref(false)

const messages = ref([
  {
    id: 1,
    type: 'assistant',
    text: '您好！我是工厂智能问答助手，很高兴为您服务。请问有什么可以帮助您的吗？',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
])

const quickQuestions = ref([
  { id: 1, text: '陈小红是哪个部门的？' },
  { id: 2, text: 'ECU控制器的常见问题有哪些？' },
  { id: 3, text: '前门密封条的供应商有哪些？' },
  { id: 4, text: '零部件有哪些？' },
  { id: 5, text: '供应商质量管理有哪些策略？' },
  { id: 6, text: '我现在有一批ECU控制器在发运场发现短路问题，帮我分析一下具体的零部件是什么？' },
  { id: 7, text: '供应商评估有哪些要点' }
])

const stats = ref({
  totalQuestions: 1250,
  accuracy: 95.8,
  responseTime: 1.2
})

/** ✅ 预览状态与方法（新增） */
const preview = reactive({
  visible: false,
  src: '',
  title: '',
  scale: 1,
  rotate: 0
})
const openImagePreview = (src, title = '查看图片') => {
  if (!src) return
  preview.visible = true
  preview.src = src
  preview.title = title
  preview.scale = 1
  preview.rotate = 0
}
const zoom = (delta) => {
  const next = +(preview.scale + delta).toFixed(2)
  preview.scale = Math.max(0.2, Math.min(6, next))
}
const rotate = (deg) => {
  preview.rotate = (preview.rotate + deg) % 360
}
const resetPreview = () => {
  preview.scale = 1
  preview.rotate = 0
}

/** ✅ 从后端响应中提取图片URL数组 */
const extractImagesFromResponse = (resp) => {
  try {
    const hits = resp?.hits || resp?.data?.hits || []
    const urls = []
    for (const h of hits) {
      if (h?.image_data_url) {
        urls.push(h.image_data_url)
      } else if (h?.meta?.file_url) {
        const u = h.meta.file_url
        const abs = u.startsWith('http') ? u : `${BACKEND_ORIGIN}${u.startsWith('/') ? u : `/${u}`}`
        urls.push(abs)
      }
    }
    return [...new Set(urls)]
  } catch {
    return []
  }
}

const sendMessage = async (message) => {
  if (!message || !message.trim()) return;
  loading.value = true
  
  // 清空输入框
  inputMessage.value = '';
  
  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    type: 'user',
    text: message,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  });

  // AI 占位
  const aiMessageId = Date.now() + 1;
  messages.value.push({
    id: aiMessageId,
    type: 'assistant',
    text: 'AI正在思考中...',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isTyping: true,
    images: [] // 用于“图片问答”模式
  });

  nextTick(scrollToBottom);

  try {
    let response;

    if (qaMode.value === 'sailisi') {
      // 赛力斯智能问答：使用流式响应
      response = await qaAPI.sailisiChat(message);
      
      // 更新AI消息，显示流式响应
      const aiMessageIndex = messages.value.findIndex(msg => msg.id === aiMessageId);
      if (aiMessageIndex !== -1) {
        messages.value[aiMessageIndex].text = response.answer || '抱歉，未收到有效回答';
        messages.value[aiMessageIndex].isTyping = false;
        nextTick(scrollToBottom);
      }
      return; // 赛力斯问答直接返回，不需要后续处理

    } else if (qaMode.value === 'graph') {
      response = await qaAPI.graphChat(message);

    } else if (qaMode.value === 'csv') {
      response = await qaAPI.csvChat(message);

    } else if (qaMode.value === 'image') {
      // ✅ 图片问答：调用 8000 端口的后端
      response = await qaAPI.imageChat(message);
    }

    // 提取回答文本
    let fullResponse = ''
    if (qaMode.value === 'sailisi' || qaMode.value === 'image') {
      if (response && response.answer) fullResponse = response.answer;
      else if (response && response.response) fullResponse = response.response;
      else if (typeof response === 'string') fullResponse = response;
      else fullResponse = JSON.stringify(response);
    } else if (qaMode.value === 'graph' || qaMode.value === 'csv') {
      if (response && response.text) fullResponse = response.text;
      else if (response && response.answer) fullResponse = response.answer;
      else if (typeof response === 'string') fullResponse = response;
      else fullResponse = JSON.stringify(response);
    }

    // ✅ 图片问答：从响应中抽取图片
    const imagesFromHits = qaMode.value === 'image' ? extractImagesFromResponse(response) : []

    // 更新AI消息
    const aiMessageIndex = messages.value.findIndex(msg => msg.id === aiMessageId);
    if (aiMessageIndex !== -1) {
      messages.value[aiMessageIndex].text = '';
      messages.value[aiMessageIndex].isTyping = false;
      if (qaMode.value === 'image') {
        messages.value[aiMessageIndex].images = imagesFromHits || []
      }

      // 逐字打字
      const chars = (fullResponse || '').split('');
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex < chars.length) {
          messages.value[aiMessageIndex].text += chars[currentIndex++];
          messages.value = [...messages.value];
        } else {
          clearInterval(typeInterval);
          nextTick(scrollToBottom);
        }
      }, 30);
    }

  } catch (error) {
    console.error('❌ 发送消息时出错:', error);
    const aiMessageIndex = messages.value.findIndex(msg => msg.id === aiMessageId);
    if (aiMessageIndex !== -1) {
      let err = '抱歉，服务暂时不可用。';
      if (error.code === 'ECONNABORTED') err = '请求超时，请稍后重试。';
      else if (error.response?.status >= 500) err = '服务器内部错误，请稍后重试。';
      else if (error.response?.status >= 400) err = '请求错误，请检查网络连接。';
      messages.value[aiMessageIndex].text = err;
      messages.value[aiMessageIndex].isTyping = false;
      messages.value[aiMessageIndex].images = [];
    }
  } finally {
    loading.value = false
  }
};

const askQuickQuestion = (question) => {
  sendMessage(question)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 健康检查（保持原样）
const checkSailisiHealth = async () => {
  sailisiHealthChecking.value = true
  try {
    const result = await qaAPI.sailisiHealth()
    if (result.status === 'healthy') {
      Message.success('赛力斯API连接正常')
    } else {
      Message.error(`赛力斯API连接失败: ${result.error}`)
    }
  } catch (error) {
    Message.error('赛力斯健康检查失败: ' + error.message)
  } finally {
    sailisiHealthChecking.value = false
  }
}

const checkGraphHealth = async () => {
  graphHealthChecking.value = true
  try {
    const result = await qaAPI.graphHealth()
    if (result.status === 'healthy') {
      Message.success('Graph问答API连接正常')
    } else {
      Message.error(`Graph问答API连接失败: ${result.error}`)
    }
  } catch (error) {
    Message.error('Graph健康检查失败: ' + error.message)
  } finally {
    graphHealthChecking.value = false
  }
}

const checkCSVHealth = async () => {
  csvHealthChecking.value = true
  try {
    const result = await qaAPI.csvHealth()
    if (result.status === 'healthy') {
      Message.success('CSV问答服务连接正常')
    } else {
      Message.error(`CSV问答服务连接失败: ${result.message || result.error}`)
    }
  } catch (error) {
    Message.error('CSV健康检查失败: ' + error.message)
  } finally {
    csvHealthChecking.value = false
  }
}

// 清除赛力斯历史对话
const clearSailisiHistory = async () => {
  clearingHistory.value = true
  try {
    await qaAPI.sailisiRefresh()
    Message.success('赛力斯历史对话已清除')
    // 同时清除前端显示的消息
    messages.value = []
  } catch (error) {
    Message.error('清除历史失败: ' + error.message)
  } finally {
    clearingHistory.value = false
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.qa-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.qa-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.qa-header {
  color: #e8f4fd;
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.qa-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.qa-header p {
  margin: 0;
  color: #000;
  font-size: 14px;
}

.qa-mode-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.qa-mode-selector .arco-radio-group {
  display: flex;
  gap: 16px;
}

.qa-mode-selector .arco-radio {
  color: #e8f4fd;
}

.qa-mode-selector .arco-radio-checked {
  color: #4facfe;
}

.qa-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  height: calc(100vh - 200px);
}

.chat-container {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #ffffff;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
}

.message.assistant .message-avatar {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  position: relative;
  z-index: 1;
}

.message.user .message-content {
  align-items: flex-end;
}

.message.assistant .message-content {
  align-items: flex-start;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  display: inline-block;
  max-width: fit-content;
  min-width: 60px;
  width: auto;
  position: relative;
  z-index: 2;
}

.message.user .message-text {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-text {
  background: rgba(255, 255, 255, 0.95);
  color: #000000;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* ✅ 图片展示网格 */
.message-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.chat-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  object-fit: cover;
  background: rgba(255, 255, 255, 0.05);
  cursor: zoom-in;  /* ✅ 新增：鼠标指针 */
}

.message-time {
  font-size: 12px;
  color: #8b9bb4;
  margin-top: 4px;
}

.typing-cursor {
  color: #00f2fe;
  animation: blink 1s infinite;
  font-weight: bold;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.chat-input {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input .arco-input-group {
  width: 100%;
  display: flex;
  gap: 8px;
}

.chat-input .arco-input {
  flex: 1;
  min-width: 0;
  height: 48px;
}

.chat-input .arco-btn {
  flex-shrink: 0;
  height: 48px;
  min-width: 80px;
}

.qa-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quick-questions,
.qa-stats {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.quick-questions h3,
.qa-stats h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-question-btn {
  text-align: left;
  color: #000;
  border: none;
  background: transparent;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  white-space: normal;
  height: auto;
  line-height: 1.4;
}

.quick-question-btn:hover {
  background: rgba(79, 172, 254, 0.1);
  color: #4facfe;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(79, 172, 254, 0.1);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #4facfe;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #8b9bb4;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ✅ 预览弹窗样式 */
.img-preview-modal .preview-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.img-preview-modal .preview-stage {
  position: relative;
  width: 100%;
  max-height: 70vh;
  overflow: auto;
  background: rgba(0,0,0,0.4);
  border-radius: 8px;
  padding: 8px;
}

.img-preview-modal .preview-img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  margin: 0 auto;
  transition: transform 0.1s linear;
  user-select: none;
  -webkit-user-drag: none;
}

/* 响应式 */
@media (max-width: 992px) {
  .qa-content { grid-template-columns: 1fr; }
  .qa-sidebar { order: -1; }
  .message-content { max-width: 80%; }
}


</style>
