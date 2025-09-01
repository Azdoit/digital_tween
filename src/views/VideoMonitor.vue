<template>
  <div class="monitor-page">
    <div class="monitor-container">
      <div class="monitor-header">
        <h2><icon-video-camera /> 视频监控系统</h2>
        <div class="monitor-controls">
          <a-space>
            <a-button 
              :type="localCamera.status === 'online' ? 'default' : 'primary'"
              size="small"
              @click="toggleLocalCamera"
              :loading="localCamera.loading"
            >
              <template #icon>
                <icon-camera v-if="localCamera.status === 'online'" />
                <icon-video-camera v-else />
              </template>
              {{ localCamera.status === 'online' ? '关闭摄像头' : '开启摄像头' }}
            </a-button>
            <a-button type="primary" size="small">
              <template #icon><icon-fullscreen /></template>
              全屏
            </a-button>
            <a-button size="small">
              <template #icon><icon-refresh /></template>
              刷新
            </a-button>
            <a-select v-model="selectedLayout" size="small" style="width: 120px">
              <a-option value="1x1">1x1 布局</a-option>
              <a-option value="2x2">2x2 布局</a-option>
              <a-option value="3x3">3x3 布局</a-option>
            </a-select>
          </a-space>
        </div>
      </div>
      
      <div class="monitor-content">
        <div class="video-grid" :class="`layout-${selectedLayout}`">
          <div 
            v-for="camera in visibleCameras" 
            :key="camera.id"
            class="video-item"
          >
            <div class="video-header">
              <div class="camera-info">
                <span class="camera-name">{{ camera.name }}</span>
                <a-tag :color="camera.status === 'online' ? 'green' : 'red'" size="small">
                  {{ camera.status === 'online' ? '在线' : '离线' }}
                </a-tag>
              </div>
              <div class="video-actions">
                <a-button size="small" type="text" @click="toggleRecording(camera.id)">
                  <template #icon>
                    <icon-video-camera v-if="!camera.recording" />
                    <icon-stop v-else />
                  </template>
                </a-button>
                <a-button size="small" type="text" @click="takeSnapshot(camera.id)">
                  <template #icon><icon-camera /></template>
                </a-button>
              </div>
            </div>
            <div class="video-placeholder">
              <!-- 本地摄像头视频流 -->
              <video 
                v-if="camera.type === 'local' && camera.stream"
                :ref="el => setVideoRef(camera.id, el)"
                class="local-video"
                autoplay
                muted
                playsinline
              ></video>
              <!-- 默认占位符 -->
              <div v-else class="video-content">
                <icon-video-camera class="video-icon" />
                <p>{{ camera.name }}</p>
                <p class="video-status">
                  {{ camera.type === 'local' ? 
                    (camera.status === 'online' ? '本地摄像头' : camera.errorMessage || '摄像头未启动') : 
                    (camera.status === 'online' ? '实时监控中' : '连接断开') 
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="monitor-sidebar">
          <div class="camera-list">
            <h3>摄像头列表</h3>
            <div class="camera-items">
              <div 
                v-for="camera in cameras" 
                :key="camera.id"
                class="camera-item"
                :class="{ active: selectedCameras.includes(camera.id) }"
                @click="toggleCamera(camera.id)"
              >
                <div class="camera-status" :class="camera.status"></div>
                <span class="camera-name">{{ camera.name }}</span>
                <span class="camera-location">{{ camera.location }}</span>
              </div>
            </div>
          </div>
          
          <div class="monitor-stats">
            <h3>监控统计</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ stats.onlineCameras }}</div>
                <div class="stat-label">在线摄像头</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.recordingCount }}</div>
                <div class="stat-label">录制中</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.storageUsed }}%</div>
                <div class="stat-label">存储使用</div>
              </div>
            </div>
          </div>
          

          
          <div class="alert-panel">
            <h3>告警信息</h3>
            <div class="alert-list">
              <div 
                v-for="alert in alerts" 
                :key="alert.id"
                class="alert-item"
                :class="alert.level"
              >
                <div class="alert-icon">
                  <icon-exclamation-circle v-if="alert.level === 'high'" />
                  <icon-info-circle v-else />
                </div>
                <div class="alert-content">
                  <div class="alert-title">{{ alert.title }}</div>
                  <div class="alert-time">{{ alert.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { webcamStore } from '@/stores/webcamStore.js'

const selectedLayout = ref('2x2')
const selectedCameras = ref([0, 1, 2, 3]) // 包含本地摄像头(id=0)

// 视频元素引用
const videoRefs = ref({})

const cameras = ref([
  { id: 0, name: '本地摄像头', location: '本机', status: 'offline', recording: false, type: 'local', stream: null },
  { id: 1, name: '主入口监控', location: 'A区', status: 'online', recording: false, type: 'remote' },
  { id: 2, name: '生产车间1', location: 'B区', status: 'online', recording: true, type: 'remote' },
  { id: 3, name: '生产车间2', location: 'C区', status: 'online', recording: false, type: 'remote' },
  { id: 4, name: '仓库监控', location: 'D区', status: 'online', recording: false, type: 'remote' },
  { id: 5, name: '设备间监控', location: 'E区', status: 'offline', recording: false, type: 'remote' },
  { id: 6, name: '办公区域', location: 'F区', status: 'online', recording: false, type: 'remote' },
  { id: 7, name: '停车场监控', location: 'G区', status: 'online', recording: false, type: 'remote' },
  { id: 8, name: '安全通道', location: 'H区', status: 'online', recording: false, type: 'remote' },
  { id: 9, name: '配电室监控', location: 'I区', status: 'online', recording: false, type: 'remote' }
])

// 本地摄像头状态（同步全局状态）
const localCamera = computed(() => {
  const localCam = cameras.value.find(c => c.id === 0)
  if (localCam) {
    // 同步全局状态到本地摄像头
    localCam.status = webcamStore.status
    localCam.stream = webcamStore.stream
  }
  return {
    status: webcamStore.status,
    loading: webcamStore.loading,
    stream: webcamStore.stream,
    errorMessage: webcamStore.errorMessage
  }
})

// 音频状态（从全局状态获取）
const audioStatus = computed(() => webcamStore.audioStatus)
const audioLoading = computed(() => webcamStore.audioLoading)
const audioRecording = computed(() => webcamStore.audioRecording)

// 音频画布引用
const audioCanvas = ref(null)
const waveformCanvas = ref(null)
const spectrumCanvas = ref(null)
const volumeCanvas = ref(null)

// 可视化类型选择
const selectedVisualization = ref('waveform')

const stats = ref({
  onlineCameras: 8,
  recordingCount: 1,
  storageUsed: 65
})

const alerts = ref([
  {
    id: 1,
    title: '设备间监控离线',
    time: '2分钟前',
    level: 'high'
  },
  {
    id: 2,
    title: '存储空间不足',
    time: '5分钟前',
    level: 'medium'
  },
  {
    id: 3,
    title: '生产车间1录制开始',
    time: '10分钟前',
    level: 'low'
  }
])

const visibleCameras = computed(() => {
  const layoutMap = {
    '1x1': 1,
    '2x2': 4,
    '3x3': 9
  }
  
  const maxCameras = layoutMap[selectedLayout.value]
  return cameras.value.filter(camera => selectedCameras.value.includes(camera.id)).slice(0, maxCameras)
})

const toggleCamera = (cameraId) => {
  const index = selectedCameras.value.indexOf(cameraId)
  if (index > -1) {
    selectedCameras.value.splice(index, 1)
  } else {
    selectedCameras.value.push(cameraId)
  }
}



// 设置视频元素引用
const setVideoRef = (cameraId, el) => {
  if (el) {
    videoRefs.value[cameraId] = el
    
    // 如果是本地摄像头，绑定到全局store
    if (cameraId === 0) {
      webcamStore.bindVideoElement(el)
    }
  }
}

// 切换本地摄像头
const toggleLocalCamera = async () => {
  if (webcamStore.status === 'online') {
    webcamStore.stopCamera()
    Message.info('摄像头已关闭')
  } else {
    try {
      await webcamStore.startCamera()
      Message.success('摄像头已开启')
    } catch (error) {
      Message.error(error.message)
    }
  }
}

// 切换音频
const toggleAudio = async () => {
  if (webcamStore.audioStatus === 'online') {
    webcamStore.stopAudio()
    Message.info('麦克风已关闭')
  } else {
    try {
      await webcamStore.startAudio()
      Message.success('麦克风已开启')
    } catch (error) {
      Message.error(error.message)
    }
  }
}

// 切换录音
const toggleAudioRecording = () => {
  try {
    if (webcamStore.audioRecording) {
      webcamStore.stopAudioRecording()
      Message.info('录音已停止')
    } else {
      webcamStore.startAudioRecording()
      Message.success('开始录音')
    }
  } catch (error) {
    Message.error(error.message)
  }
}

const toggleRecording = (cameraId) => {
  const camera = cameras.value.find(c => c.id === cameraId)
  if (camera) {
    if (camera.type === 'local' && webcamStore.status === 'offline') {
      Message.warning('请先开启摄像头')
      return
    }
    
    camera.recording = !camera.recording
    stats.value.recordingCount += camera.recording ? 1 : -1
    
    if (camera.recording) {
      Message.success(`${camera.name} 开始录制`)
    } else {
      Message.info(`${camera.name} 停止录制`)
    }
  }
}

const takeSnapshot = (cameraId) => {
  const camera = cameras.value.find(c => c.id === cameraId)
  if (camera) {
    if (camera.type === 'local') {
      if (webcamStore.status === 'offline') {
        Message.warning('请先开启摄像头')
        return
      }
      
      // 本地摄像头截图
      const videoElement = videoRefs.value[cameraId]
      if (videoElement) {
        const canvas = document.createElement('canvas')
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(videoElement, 0, 0)
        
        // 下载截图
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `screenshot-${camera.name}-${new Date().getTime()}.png`
          a.click()
          URL.revokeObjectURL(url)
        })
        
        Message.success('截图成功')
      }
    } else {
      Message.success(`${camera.name} 截图成功`)
    }
  }
}

// 组件挂载时的处理
onMounted(() => {
  // 检查浏览器是否支持摄像头
  if (!webcamStore.isSupported()) {
    Message.error('当前浏览器不支持摄像头功能')
  }
  
  // 检查音频支持
  if (!webcamStore.isAudioSupported()) {
    Message.warning('当前浏览器不支持音频可视化功能')
  }
  
  // 绑定音频画布
  if (audioCanvas.value) {
    webcamStore.bindAudioCanvas(audioCanvas.value)
  }
})

// 监听可视化类型变化
watch(selectedVisualization, (newType) => {
  webcamStore.setVisualizationType(newType)
})

// 监听音频画布引用变化
watch(audioCanvas, (newCanvas) => {
  if (newCanvas) {
    webcamStore.bindAudioCanvas(newCanvas, 'main')
  }
})

watch(waveformCanvas, (newCanvas) => {
  if (newCanvas) {
    webcamStore.bindAudioCanvas(newCanvas, 'waveform')
  }
})

watch(spectrumCanvas, (newCanvas) => {
  if (newCanvas) {
    webcamStore.bindAudioCanvas(newCanvas, 'spectrum')
  }
})

watch(volumeCanvas, (newCanvas) => {
  if (newCanvas) {
    webcamStore.bindAudioCanvas(newCanvas, 'volume')
  }
})

// 获取图表标题
const getChartTitle = (type) => {
  const titles = {
    waveform: '实时波形 (振幅-时间)',
    spectrum: '频谱分析 (频率分布)',
    volume: '音量历史 (音量-时间)'
  }
  return titles[type] || '音频可视化'
}

// 组件卸载时只解绑元素，不关闭摄像头和音频
onUnmounted(() => {
  webcamStore.unbindVideoElement()
  webcamStore.unbindAudioCanvas()
})
</script>

<style scoped>
.monitor-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.monitor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.monitor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.monitor-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.monitor-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  height: calc(100vh - 200px);
}

.video-grid {
  display: grid;
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.video-grid.layout-1x1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.video-grid.layout-2x2 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.video-grid.layout-3x3 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.video-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.video-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.video-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.camera-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.camera-name {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.video-actions {
  display: flex;
  gap: 4px;
}

.video-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a2332 0%, #0c1426 100%);
  position: relative;
}

.video-content {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.video-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.video-status {
  font-size: 12px;
  margin-top: 4px;
}

.monitor-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.camera-list,
.monitor-stats,
.alert-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.camera-list h3,
.monitor-stats h3,
.alert-panel h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.camera-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.camera-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.camera-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.camera-item.active {
  background: rgba(24, 144, 255, 0.2);
  border: 1px solid rgba(24, 144, 255, 0.3);
}

.camera-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.camera-status.online {
  background: #52c41a;
}

.camera-status.offline {
  background: #f5222d;
}

.camera-item .camera-name {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  flex: 1;
}

.camera-location {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
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
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.alert-item.high {
  background: rgba(245, 34, 45, 0.2);
  border-left: 4px solid #f5222d;
}

.alert-item.medium {
  background: rgba(250, 173, 20, 0.2);
  border-left: 4px solid #faad14;
}

.alert-item.low {
  background: rgba(82, 196, 26, 0.2);
  border-left: 4px solid #52c41a;
}

.alert-icon {
  font-size: 16px;
  color: #ffffff;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 2px;
}

.alert-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 本地视频样式 */
.local-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  background: #000;
}

.video-placeholder {
  position: relative;
  overflow: hidden;
}

/* 音频面板样式 */
.audio-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.audio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.audio-panel h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.audio-visualizer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audio-visualizer.single {
  min-height: 160px;
}

.audio-visualizer.multi {
  min-height: 200px;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-container.full-width {
  grid-column: 1 / -1;
}

.chart-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-align: center;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.audio-canvas {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.audio-canvas.small {
  height: 80px;
}

.audio-canvas.volume {
  height: 60px;
}

.audio-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.audio-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
  transition: all 0.3s ease;
}

.audio-indicator.recording {
  background: #f5222d;
  animation: pulse 1s infinite;
}

.audio-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 34, 45, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(245, 34, 45, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 34, 45, 0);
  }
}

/* 响应式设计 */
@media (max-width: 992px) {
  .monitor-content {
    grid-template-columns: 1fr;
  }
  
  .monitor-sidebar {
    order: -1;
  }
  
  .video-grid.layout-2x2,
  .video-grid.layout-3x3 {
    grid-template-columns: 1fr;
  }
  
  .audio-canvas {
    height: 80px;
  }
}
</style>
