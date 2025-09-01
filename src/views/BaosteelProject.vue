<template>
  <div class="baosteel-project">
    <!-- 视频标题栏 -->
    <div class="content-header">
      <div class="header-info">
        <h2 class="title">{{ currentVideo.title }}</h2>
        <p class="subtitle">{{ currentVideo.description }}</p>
      </div>
      <div class="header-meta">
        <a-tag :color="getFormatColor(currentVideo.format)" size="small">
          {{ currentVideo.format }}
        </a-tag>
      </div>
    </div>

    <!-- 视频播放器 -->
    <div class="video-container">
      <div class="video-wrapper">
        <video 
          ref="videoPlayer"
          controls
          autoplay
          loop
          muted
          preload="metadata"
          class="main-video"
          :key="videoSrc"
          @loadeddata="onVideoLoaded"
          @error="onVideoError"
          @play="onVideoPlay"
          @pause="onVideoPause"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onMetadataLoaded"
        >
          <source :src="videoSrc" :type="videoMimeType">
          您的浏览器不支持视频播放。
        </video>
        
        <!-- 加载状态覆盖层 -->
        <div class="video-overlay" v-if="!videoLoaded && !videoError">
          <div class="loading-indicator">
            <a-spin size="large" />
            <p class="loading-text">正在加载视频...</p>
          </div>
        </div>

        <!-- 错误状态覆盖层 -->
        <div class="video-overlay" v-if="videoError">
          <div class="error-indicator">
            <icon-exclamation-circle class="error-icon" />
            <p class="error-text">视频加载失败</p>
            <a-button @click="retryLoad" type="primary" size="small">
              重试加载
            </a-button>
          </div>
        </div>
      </div>

      <!-- 视频信息面板 -->
      <div class="video-info-panel">
        <div class="info-section">
          <h3 class="section-title">
            <icon-info-circle />
            播放信息
          </h3>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">状态：</span>
              <a-tag :color="videoStatusInfo.color" size="small">
                {{ videoStatusInfo.text }}
              </a-tag>
            </div>
            
            <div class="info-item" v-if="videoMetadata.duration">
              <span class="info-label">总时长：</span>
              <span class="info-value">{{ formatDuration(videoMetadata.duration) }}</span>
            </div>
            
            <div class="info-item" v-if="videoMetadata.currentTime">
              <span class="info-label">当前进度：</span>
              <span class="info-value">{{ formatDuration(videoMetadata.currentTime) }}</span>
            </div>
            
            <div class="info-item" v-if="videoMetadata.resolution">
              <span class="info-label">分辨率：</span>
              <span class="info-value">{{ videoMetadata.resolution }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">播放模式：</span>
              <span class="info-value">
                <a-tag color="green" size="mini">自动播放</a-tag>
                <a-tag color="blue" size="mini">循环播放</a-tag>
              </span>
            </div>
          </div>
        </div>

        <!-- 快捷控制 -->
        <div class="control-section">
          <a-space direction="vertical" fill>
            <a-button-group fill>
              <a-button @click="playPause" :disabled="!videoLoaded">
                <template #icon>
                  <icon-play-arrow v-if="!isPlaying" />
                  <icon-pause v-else />
                </template>
                {{ isPlaying ? '暂停' : '播放' }}
              </a-button>
              <a-button @click="restartVideo" :disabled="!videoLoaded">
                <template #icon><icon-refresh /></template>
                重播
              </a-button>
            </a-button-group>
            
            <a-button @click="downloadVideo" type="outline" long>
              <template #icon><icon-download /></template>
              下载视频
            </a-button>
          </a-space>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()

// 视频数据映射
const videoMap = {
  'manyou': {
    id: 'manyou',
    title: '漫游展示',
    description: '3D虚拟工厂漫游展示，全方位展示数字孪生工厂模型',
    filename: '漫游展示.mp4',
    format: 'MP4'
  },
  'ai-fire': {
    id: 'ai-fire',
    title: 'AI火情监测',
    description: '基于人工智能的火灾监测系统，实时识别和预警',
    filename: 'AI火情监测.mp4',
    format: 'MP4'
  },
  'safety-monitor': {
    id: 'safety-monitor',
    title: '安全行为监测',
    description: '智能安全行为识别系统，监控工作人员安全操作',
    filename: '安全行为监测.mp4',
    format: 'MP4'
  },
  'digital-platform': {
    id: 'digital-platform',
    title: '数字化集成平台',
    description: '完整的数字化工厂管理平台展示',
    filename: '数字化集成平台.mp4',
    format: 'MP4'
  },
  'oil-depot': {
    id: 'oil-depot',
    title: '无人油库监控平台',
    description: '无人化油库智能监控与管理系统',
    filename: '无人油库点监平台.mp4',
    format: 'MP4'
  },
  'steel-tracking': {
    id: 'steel-tracking',
    title: '钢坯智能追踪',
    description: '钢坯生产过程的智能化追踪与监控',
    filename: '钢坯智能追踪.mp4',
    format: 'MP4'
  },
  'video-splice': {
    id: 'video-splice',
    title: '视频拼接展示',
    description: '多视角视频拼接技术演示',
    filename: '视频拼接.mp4',
    format: 'MP4'
  }
}

// 组件状态
const videoPlayer = ref(null)
const videoLoaded = ref(false)
const videoError = ref(false)
const isPlaying = ref(false)
const videoMetadata = ref({
  duration: 0,
  currentTime: 0,
  resolution: ''
})

// 计算属性
const currentVideo = computed(() => {
  const videoId = route.query.video || 'manyou' // 默认显示漫游视频
  return videoMap[videoId] || videoMap['manyou']
})

const videoSrc = computed(() => {
  return `/${currentVideo.value.filename}`
})

const videoMimeType = computed(() => {
  const format = currentVideo.value.format.toLowerCase()
  return format === 'mp4' ? 'video/mp4' : 'video/x-msvideo'
})

const videoStatusInfo = computed(() => {
  if (videoError.value) {
    return { color: 'red', text: '加载失败' }
  } else if (videoLoaded.value) {
    return isPlaying.value 
      ? { color: 'green', text: '播放中' }
      : { color: 'blue', text: '已暂停' }
  } else {
    return { color: 'orange', text: '加载中' }
  }
})

// 方法
const getFormatColor = (format) => {
  switch (format) {
    case 'MP4': return 'blue'
    case 'AVI': return 'orange'
    default: return 'gray'
  }
}

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 重置视频状态
const resetVideoState = () => {
  videoLoaded.value = false
  videoError.value = false
  isPlaying.value = false
  videoMetadata.value = {
    duration: 0,
    currentTime: 0,
    resolution: ''
  }
}

// 视频事件处理
const onVideoLoaded = () => {
  videoLoaded.value = true
  videoError.value = false
  
  // 确保视频自动播放
  if (videoPlayer.value) {
    videoPlayer.value.play().catch(err => {
      console.log('自动播放失败，可能需要用户交互:', err)
      // 如果自动播放失败，取消静音后再尝试
      videoPlayer.value.muted = false
    })
  }
}

const onVideoError = () => {
  videoError.value = true
  videoLoaded.value = false
  Message.error(`视频"${currentVideo.value.title}"加载失败`)
}

const onVideoPlay = () => {
  isPlaying.value = true
}

const onVideoPause = () => {
  isPlaying.value = false
}

const onTimeUpdate = () => {
  if (videoPlayer.value) {
    videoMetadata.value.currentTime = videoPlayer.value.currentTime
  }
}

const onMetadataLoaded = () => {
  if (videoPlayer.value) {
    const video = videoPlayer.value
    videoMetadata.value.duration = video.duration
    videoMetadata.value.resolution = `${video.videoWidth} × ${video.videoHeight}`
  }
}

// 控制方法
const playPause = () => {
  if (!videoPlayer.value) return
  
  if (isPlaying.value) {
    videoPlayer.value.pause()
  } else {
    videoPlayer.value.play()
  }
}

const restartVideo = () => {
  if (!videoPlayer.value) return
  
  videoPlayer.value.currentTime = 0
  videoPlayer.value.play()
  Message.info('重新播放')
}

const retryLoad = () => {
  resetVideoState()
  if (videoPlayer.value) {
    videoPlayer.value.load()
    // 重新加载后确保自动播放
    videoPlayer.value.addEventListener('loadeddata', () => {
      videoPlayer.value.play().catch(err => {
        console.log('重试后自动播放失败:', err)
      })
    }, { once: true })
  }
}

const downloadVideo = () => {
  const link = document.createElement('a')
  link.href = videoSrc.value
  link.download = currentVideo.value.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  Message.success('开始下载视频')
}

// 监听路由变化，切换视频时重置状态
watch(() => route.query.video, () => {
  resetVideoState()
})

// 生命周期
onMounted(() => {
  console.log('宝钢项目页面已加载，当前视频:', currentVideo.value.title)
  
  // 如果没有video参数，默认跳转到漫游视频
  if (!route.query.video) {
    router.replace({ path: '/baosteel', query: { video: 'manyou' } })
  }
  
  // 提示用户自动播放功能
  setTimeout(() => {
    Message.info({
      content: '视频将自动播放并循环，如果没有声音请检查浏览器设置',
      duration: 3000
    })
  }, 1000)
})

onUnmounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.pause()
  }
})
</script>

<style scoped>
.baosteel-project {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0c1426 0%, #1a2332 100%);
  overflow: hidden;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.header-info {
  flex: 1;
}

.title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 14px;
  color: #b8c5d1;
  margin: 0;
  line-height: 1.5;
}

.header-meta {
  flex: 0 0 auto;
}

.video-container {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

.video-wrapper {
  flex: 1;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.main-video {
  width: 100%;
  height: 100%;
  display: block;
  background: #000;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.loading-indicator,
.error-indicator {
  text-align: center;
  color: #e8f4fd;
}

.loading-text,
.error-text {
  margin: 16px 0;
  font-size: 14px;
  color: #b8c5d1;
}

.error-icon {
  font-size: 48px;
  color: #ff6b6b;
  margin-bottom: 16px;
}

.video-info-panel {
  width: 300px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  flex: 1;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #e8f4fd;
  margin-bottom: 16px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-label {
  font-size: 13px;
  color: #b8c5d1;
}

.info-value {
  font-size: 13px;
  color: #e8f4fd;
  font-weight: 500;
}

.control-section {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .video-container {
    flex-direction: column;
  }
  
  .video-info-panel {
    width: 100%;
    flex-direction: row;
    gap: 20px;
  }
  
  .info-section {
    flex: 1;
  }
  
  .control-section {
    flex: 0 0 auto;
    padding-top: 0;
    padding-left: 20px;
    border-top: none;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
  }
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .header-info,
  .header-meta {
    flex: none;
  }
  
  .title {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 13px;
  }
  
  .video-container {
    padding: 15px;
  }
  
  .video-info-panel {
    flex-direction: column;
  }
  
  .control-section {
    padding-left: 0;
    padding-top: 16px;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
