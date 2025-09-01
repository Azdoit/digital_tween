<template>
  <div class="video-player-container">
    <div class="video-header">
      <h2 class="page-title">视频播放</h2>
      <p class="page-description">边坡监测与东方明珠展示视频</p>
    </div>

    <div class="video-grid">
      <!-- 边坡视频 -->
      <div class="video-card">
        <div class="video-header-card">
          <h3 class="video-title">
            <icon-video-camera class="video-icon" />
            边坡参数化
          </h3>
          <div class="video-controls">
            <a-button 
              type="primary" 
              size="small" 
              @click="togglePlay('slope')"
              :loading="loading.slope"
            >
              <template #icon>
                <icon-play-arrow v-if="!playing.slope" />
                <icon-pause v-else />
              </template>
              {{ playing.slope ? '暂停' : '播放' }}
            </a-button>
                         <a-button 
               type="outline" 
               size="small" 
               @click="restartVideo('slope')"
             >
               <template #icon><icon-refresh /></template>
               重新播放
             </a-button>
             <a-button 
               type="outline" 
               size="small" 
               @click="toggleFullscreen('slope')"
             >
               <template #icon><icon-fullscreen /></template>
               全屏
             </a-button>
          </div>
        </div>
        <div class="video-wrapper">
                                  <video
               ref="slopeVideo"
               class="video-element"
               preload="metadata"
               loop
               @loadedmetadata="onVideoLoaded('slope')"
               @ended="onVideoEnded('slope')"
               @error="onVideoError('slope')"
               @dblclick="toggleFullscreen('slope')"
             >
            <source src="/边坡.mp4" type="video/mp4">
            您的浏览器不支持视频播放。
          </video>
          <div v-if="loading.slope" class="video-loading">
            <a-spin size="large" />
            <p>视频加载中...</p>
          </div>
        </div>
        <div class="video-info">
          <p class="video-description">边坡体系参数化建模+径流分析</p>
        </div>
      </div>

      <!-- 东方明珠视频 -->
      <div class="video-card">
        <div class="video-header-card">
          <h3 class="video-title">
            <icon-video-camera class="video-icon" />
            东方明珠展示
          </h3>
          <div class="video-controls">
            <a-button 
              type="primary" 
              size="small" 
              @click="togglePlay('oriental')"
              :loading="loading.oriental"
            >
              <template #icon>
                <icon-play-arrow v-if="!playing.oriental" />
                <icon-pause v-else />
              </template>
              {{ playing.oriental ? '暂停' : '播放' }}
            </a-button>
                         <a-button 
               type="outline" 
               size="small" 
               @click="restartVideo('oriental')"
             >
               <template #icon><icon-refresh /></template>
               重新播放
             </a-button>
             <a-button 
               type="outline" 
               size="small" 
               @click="toggleFullscreen('oriental')"
             >
               <template #icon><icon-fullscreen /></template>
               全屏
             </a-button>
          </div>
        </div>
        <div class="video-wrapper">
                                  <video
               ref="orientalVideo"
               class="video-element"
               preload="metadata"
               loop
               @loadedmetadata="onVideoLoaded('oriental')"
               @ended="onVideoEnded('oriental')"
               @error="onVideoError('oriental')"
               @dblclick="toggleFullscreen('oriental')"
             >
            <source src="/东方明珠.mp4" type="video/mp4">
            您的浏览器不支持视频播放。
          </video>
          <div v-if="loading.oriental" class="video-loading">
            <a-spin size="large" />
            <p>视频加载中...</p>
          </div>
        </div>
        <div class="video-info">
          <p class="video-description">东方明珠塔的精彩展示视频</p>
        </div>
      </div>
    </div>

    <!-- 全局控制 -->
    <div class="global-controls">
      <a-space>
        <a-button 
          type="primary" 
          @click="playAll"
          :loading="loading.slope || loading.oriental"
        >
          <template #icon><icon-play-arrow /></template>
          播放全部
        </a-button>
        <a-button 
          type="outline" 
          @click="pauseAll"
        >
          <template #icon><icon-pause /></template>
          暂停全部
        </a-button>
        <a-button 
          type="outline" 
          @click="restartAll"
        >
          <template #icon><icon-refresh /></template>
          重新播放全部
        </a-button>
        <a-button 
          type="outline" 
          @click="toggleVideoMode"
        >
          <template #icon><icon-fullscreen /></template>
          {{ videoMode === 'cover' ? '适应屏幕' : '填充屏幕' }}
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'

// 视频引用
const slopeVideo = ref(null)
const orientalVideo = ref(null)

// 播放状态
const playing = reactive({
  slope: false,
  oriental: false
})

// 加载状态
const loading = reactive({
  slope: true,
  oriental: true
})

// 视频显示模式
const videoMode = ref('cover') // 'cover' 或 'contain'

// 全屏状态
const fullscreenState = reactive({
  slope: false,
  oriental: false
})

// 视频元素映射
const videoRefs = {
  slope: slopeVideo,
  oriental: orientalVideo
}

// 视频加载完成
const onVideoLoaded = (videoType) => {
  loading[videoType] = false
  console.log(`${videoType} 视频加载完成`)
}

// 视频播放结束（循环播放时不会触发）
const onVideoEnded = (videoType) => {
  // 由于设置了循环播放，这个事件通常不会触发
  // 保留此函数以防需要处理其他情况
  console.log(`${videoType} 视频播放结束`)
}

// 视频加载错误
const onVideoError = (videoType) => {
  loading[videoType] = false
  Message.error(`${videoType === 'slope' ? '边坡' : '东方明珠'} 视频加载失败`)
}

// 切换播放/暂停
const togglePlay = (videoType) => {
  const video = videoRefs[videoType].value
  if (!video) return

  if (playing[videoType]) {
    video.pause()
    playing[videoType] = false
  } else {
    video.play().then(() => {
      playing[videoType] = true
    }).catch(error => {
      Message.error(`播放失败: ${error.message}`)
    })
  }
}

// 重新播放视频
const restartVideo = (videoType) => {
  const video = videoRefs[videoType].value
  if (!video) return

  video.currentTime = 0
  video.play().then(() => {
    playing[videoType] = true
  }).catch(error => {
    Message.error(`重新播放失败: ${error.message}`)
  })
}

// 播放全部视频
const playAll = () => {
  Object.keys(videoRefs).forEach(videoType => {
    if (!loading[videoType]) {
      togglePlay(videoType)
    }
  })
}

// 暂停全部视频
const pauseAll = () => {
  Object.keys(videoRefs).forEach(videoType => {
    if (playing[videoType]) {
      togglePlay(videoType)
    }
  })
}

// 重新播放全部视频
const restartAll = () => {
  Object.keys(videoRefs).forEach(videoType => {
    if (!loading[videoType]) {
      restartVideo(videoType)
    }
  })
}

// 切换视频显示模式
const toggleVideoMode = () => {
  videoMode.value = videoMode.value === 'cover' ? 'contain' : 'cover'
}

// 切换全屏
const toggleFullscreen = (videoType) => {
  const video = videoRefs[videoType].value
  if (!video) return

  if (!fullscreenState[videoType]) {
    // 进入全屏
    if (video.requestFullscreen) {
      video.requestFullscreen()
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen()
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen()
    }
    fullscreenState[videoType] = true
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
    fullscreenState[videoType] = false
  }
}

onMounted(() => {
  // 组件挂载后的初始化
  console.log('视频播放页面已加载')
  
  // 监听全屏状态变化
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('msfullscreenchange', handleFullscreenChange)
})

// 处理全屏状态变化
const handleFullscreenChange = () => {
  const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement)
  
  if (!isFullscreen) {
    // 退出全屏时重置所有全屏状态
    fullscreenState.slope = false
    fullscreenState.oriental = false
  }
}

onUnmounted(() => {
  // 组件卸载时暂停所有视频
  Object.keys(videoRefs).forEach(videoType => {
    const video = videoRefs[videoType].value
    if (video && !video.paused) {
      video.pause()
    }
  })
  
  // 清理全屏事件监听器
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('msfullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.video-player-container {
  padding: 20px;
  background: linear-gradient(135deg, #0c1426 0%, #1a2332 100%);
  min-height: 100vh;
  color: #e8f4fd;
}

.video-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
}

.page-description {
  font-size: 16px;
  color: #b8c5d1;
  margin: 0;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.video-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  /* 确保所有卡片具有相同的高度 */
  display: flex;
  flex-direction: column;
  height: 600px;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(79, 172, 254, 0.2);
  border-color: rgba(79, 172, 254, 0.3);
}

.video-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  /* 确保头部区域不会占用太多空间 */
  flex-shrink: 0;
}

.video-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #e8f4fd;
  margin: 0;
}

.video-icon {
  font-size: 24px;
  color: #4facfe;
}

.video-controls {
  display: flex;
  gap: 12px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  margin-bottom: 16px;
  /* 让视频区域占据剩余空间 */
  flex: 1;
  min-height: 400px;
}

.video-element {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 12px;
  object-fit: v-bind(videoMode);
  cursor: pointer;
}

/* 全屏时的样式 */
.video-element:fullscreen {
  border-radius: 0;
  object-fit: contain;
}

.video-element:-webkit-full-screen {
  border-radius: 0;
  object-fit: contain;
}

.video-element:-ms-fullscreen {
  border-radius: 0;
  object-fit: contain;
}

.video-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #e8f4fd;
}

.video-loading p {
  margin-top: 12px;
  font-size: 14px;
}

.video-info {
  padding: 16px 0;
  /* 确保信息区域不会占用太多空间 */
  flex-shrink: 0;
}

.video-description {
  color: #b8c5d1;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.global-controls {
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .video-header-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .video-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .video-card {
    padding: 16px;
    height: 500px; /* 移动端稍微降低高度 */
  }
  
  .video-wrapper {
    min-height: 300px; /* 移动端降低最小高度 */
  }
}

@media (max-width: 480px) {
  .video-player-container {
    padding: 16px;
  }
  
  .video-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .global-controls {
    padding: 16px;
  }
}
</style>
