<template>
  <div class="gac-project">
    <div class="page-header">
      <h2><icon-car /> 传祺洞察大数据平台</h2>
      <p>智能汽车制造数据洞察与决策支持系统</p>
    </div>

    <div class="content-container">
      <!-- 视频播放区域 -->
      <div class="video-section">
        <div class="video-container">
          <video
            ref="videoPlayer"
            class="video-player"
            controls
            preload="metadata"
            @loadedmetadata="onVideoLoaded"
            @timeupdate="onTimeUpdate"
            @ended="onVideoEnded"
          >
            <source src="/传祺洞察大数据平台.mp4" type="video/mp4" />
            您的浏览器不支持视频播放。
          </video>
          
          <!-- 视频控制面板 -->
          <div class="video-controls">
            <div class="control-buttons">
              <a-button @click="togglePlay" :icon="isPlaying ? 'icon-pause' : 'icon-play'">
                {{ isPlaying ? '暂停' : '播放' }}
              </a-button>
              <a-button @click="restartVideo" icon="icon-refresh">
                重新播放
              </a-button>
              <a-button @click="toggleFullscreen" icon="icon-fullscreen">
                全屏
              </a-button>
            </div>
            
            <!-- 进度条 -->
            <div class="progress-container">
              <div class="progress-bar" @click="seekVideo">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
              </div>
              <span class="time-display">{{ currentTime }} / {{ duration }}</span>
            </div>
          </div>
        </div>
             </div>
     </div>
   </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'

// 视频播放相关状态
const videoPlayer = ref(null)
const isPlaying = ref(false)
const currentTime = ref('00:00')
const duration = ref('00:00')
const progress = ref(0)

// 视频事件处理
const onVideoLoaded = () => {
  if (videoPlayer.value) {
    duration.value = formatTime(videoPlayer.value.duration)
  }
}

const onTimeUpdate = () => {
  if (videoPlayer.value) {
    currentTime.value = formatTime(videoPlayer.value.currentTime)
    progress.value = (videoPlayer.value.currentTime / videoPlayer.value.duration) * 100
  }
}

const onVideoEnded = () => {
  isPlaying.value = false
  Message.success('视频播放完成')
}

// 视频控制方法
const togglePlay = () => {
  if (videoPlayer.value) {
    if (isPlaying.value) {
      videoPlayer.value.pause()
    } else {
      videoPlayer.value.play()
    }
    isPlaying.value = !isPlaying.value
  }
}

const restartVideo = () => {
  if (videoPlayer.value) {
    videoPlayer.value.currentTime = 0
    videoPlayer.value.play()
    isPlaying.value = true
  }
}

const toggleFullscreen = () => {
  if (videoPlayer.value) {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoPlayer.value.requestFullscreen()
    }
  }
}

const seekVideo = (event) => {
  if (videoPlayer.value) {
    const rect = event.target.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = clickX / rect.width
    videoPlayer.value.currentTime = percentage * videoPlayer.value.duration
  }
}

// 工具方法
const formatTime = (seconds) => {
  if (isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 监听视频播放状态
const handleVideoPlay = () => {
  isPlaying.value = true
}

const handleVideoPause = () => {
  isPlaying.value = false
}

onMounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.addEventListener('play', handleVideoPlay)
    videoPlayer.value.addEventListener('pause', handleVideoPause)
  }
})

onUnmounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.removeEventListener('play', handleVideoPlay)
    videoPlayer.value.removeEventListener('pause', handleVideoPause)
  }
})
</script>

<style lang="scss" scoped>
.gac-project {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;

  .page-header {
    margin-bottom: 24px;
    text-align: center;
    
    h2 {
      margin: 0 0 8px 0;
      color: #1d2129;
      font-size: 28px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    
    p {
      margin: 0;
      color: #86909c;
      font-size: 16px;
    }
  }

  .content-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .video-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .video-container {
      .video-player {
        width: 100%;
        max-width: 800px;
        height: auto;
        border-radius: 8px;
        margin: 0 auto;
        display: block;
      }

      .video-controls {
        margin-top: 16px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;

        .control-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 12px;

          .progress-bar {
            flex: 1;
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            cursor: pointer;
            position: relative;

            .progress-fill {
              height: 100%;
              background: #514ef2;
              border-radius: 3px;
              transition: width 0.1s ease;
            }
          }

          .time-display {
            font-size: 14px;
            color: #6b7280;
            min-width: 80px;
          }
        }
      }
    }
     }
 }

// 响应式设计
@media (max-width: 768px) {
  .gac-project {
    padding: 16px;

    .page-header h2 {
      font-size: 24px;
    }
  }
}
</style>
