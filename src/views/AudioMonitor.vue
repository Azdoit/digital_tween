<template>
  <div class="audio-monitor-page">
    <div class="audio-monitor-container">
      <div class="audio-header">
        <h2><icon-sound /> 音频监控系统</h2>
        <div class="audio-controls">
          <a-space>
            <a-button 
              :type="audioStatus === 'online' ? 'default' : 'primary'"
              size="small"
              @click="toggleAudio"
              :loading="audioLoading"
            >
              <template #icon>
                <icon-sound v-if="audioStatus === 'online'" />
                <icon-mute v-else />
              </template>
              {{ audioStatus === 'online' ? '关闭麦克风' : '开启麦克风' }}
            </a-button>

            <a-select v-model="selectedVisualization" size="small" style="width: 140px">
              <a-option value="waveform">实时波形</a-option>
              <a-option value="spectrum">频谱分析</a-option>
              <a-option value="volume">音量历史</a-option>
              <a-option value="multi">综合显示</a-option>
            </a-select>
          </a-space>
        </div>
      </div>
      
      <div class="audio-content">
        <!-- 主要可视化区域 -->
        <div class="visualization-main">
          <!-- 单图显示模式 -->
          <div v-if="selectedVisualization !== 'multi'" class="single-chart">
            <div class="chart-header">
              <h3>{{ getChartTitle(selectedVisualization) }}</h3>
              <div class="chart-info">
                <a-tag :color="audioStatus === 'online' ? 'green' : 'red'" size="small">
                  {{ audioStatus === 'online' ? '实时监控' : '监控停止' }}
                </a-tag>
              </div>
            </div>
            <div class="chart-container large">
              <canvas 
                ref="mainCanvas"
                :width="800"
                :height="300"
                class="audio-canvas main"
              ></canvas>
            </div>
          </div>
          
          <!-- 多图显示模式 -->
          <div v-else class="multi-charts">
            <div class="charts-grid">
              <div class="chart-item">
                <div class="chart-header">
                  <h3>实时波形</h3>
                  <span class="chart-desc">显示音频信号的振幅变化</span>
                </div>
                <canvas 
                  ref="waveformCanvas"
                  :width="380"
                  :height="180"
                  class="audio-canvas"
                ></canvas>
              </div>
              
              <div class="chart-item">
                <div class="chart-header">
                  <h3>频谱分析</h3>
                  <span class="chart-desc">显示不同频率的强度分布</span>
                </div>
                <canvas 
                  ref="spectrumCanvas"
                  :width="380"
                  :height="180"
                  class="audio-canvas"
                ></canvas>
              </div>
              
              <div class="chart-item full-width">
                <div class="chart-header">
                  <h3>音量历史</h3>
                  <span class="chart-desc">显示音量随时间的变化趋势</span>
                </div>
                <canvas 
                  ref="volumeCanvas"
                  :width="780"
                  :height="120"
                  class="audio-canvas"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧信息面板 -->
        <div class="info-panel">
          <div class="status-card">
            <h3>音频状态</h3>
            <div class="status-items">
              <div class="status-item">
                <span class="status-label">麦克风状态</span>
                <a-tag :color="audioStatus === 'online' ? 'green' : 'gray'" size="small">
                  {{ audioStatus === 'online' ? '在线' : '离线' }}
                </a-tag>
              </div>

              <div class="status-item">
                <span class="status-label">可视化模式</span>
                <a-tag color="purple" size="small">
                  {{ getVisualizationName(selectedVisualization) }}
                </a-tag>
              </div>
            </div>
          </div>
          
          <div class="stats-card">
            <h3>实时数据</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ currentVolume }}%</div>
                <div class="stat-label">当前音量</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ peakVolume }}%</div>
                <div class="stat-label">峰值音量</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">60fps</div>
                <div class="stat-label">刷新率</div>
              </div>
            </div>
          </div>
          
          <div class="settings-card">
            <h3>音频设置</h3>
            <div class="settings-items">
              <div class="setting-item">
                <span class="setting-label">采样率</span>
                <span class="setting-value">44.1 kHz</span>
              </div>
              <div class="setting-item">
                <span class="setting-label">分析精度</span>
                <span class="setting-value">256 点 FFT</span>
              </div>
              <div class="setting-item">
                <span class="setting-label">更新频率</span>
                <span class="setting-value">60 FPS</span>
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

// 音频状态
const audioStatus = computed(() => webcamStore.audioStatus)
const audioLoading = computed(() => webcamStore.audioLoading)

// 画布引用
const mainCanvas = ref(null)
const waveformCanvas = ref(null)
const spectrumCanvas = ref(null)
const volumeCanvas = ref(null)

// 可视化设置
const selectedVisualization = ref('multi')

// 实时数据
const currentVolume = ref(0)
const peakVolume = ref(0)

// 音频控制
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



// 获取图表标题
const getChartTitle = (type) => {
  const titles = {
    waveform: '实时音频波形分析',
    spectrum: '音频频谱分析',
    volume: '音量变化历史记录'
  }
  return titles[type] || '音频可视化'
}

const getVisualizationName = (type) => {
  const names = {
    waveform: '波形模式',
    spectrum: '频谱模式',
    volume: '音量模式',
    multi: '综合模式'
  }
  return names[type] || '未知模式'
}

// 监听可视化类型变化
watch(selectedVisualization, (newType) => {
  webcamStore.setVisualizationType(newType)
})

// 监听画布
watch(mainCanvas, (newCanvas) => {
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

onMounted(() => {
  // 检查音频支持
  if (!webcamStore.isAudioSupported()) {
    Message.warning('当前浏览器不支持音频功能')
  }
  
  // 设置初始可视化类型
  webcamStore.setVisualizationType(selectedVisualization.value)
  
  // 绑定画布
  setTimeout(() => {
    if (mainCanvas.value) {
      webcamStore.bindAudioCanvas(mainCanvas.value, 'main')
    }
    if (waveformCanvas.value) {
      webcamStore.bindAudioCanvas(waveformCanvas.value, 'waveform')
    }
    if (spectrumCanvas.value) {
      webcamStore.bindAudioCanvas(spectrumCanvas.value, 'spectrum')
    }
    if (volumeCanvas.value) {
      webcamStore.bindAudioCanvas(volumeCanvas.value, 'volume')
    }
  }, 100)
  
  // 模拟实时数据更新
  const updateStats = () => {
    if (webcamStore.audioStatus === 'online') {
      // 从音频历史数据中获取实际音量
      if (webcamStore.volumeHistory.length > 0) {
        const latestVolume = webcamStore.volumeHistory[webcamStore.volumeHistory.length - 1]
        currentVolume.value = Math.floor(latestVolume * 100)
        peakVolume.value = Math.max(peakVolume.value, currentVolume.value)
      }
    } else {
      currentVolume.value = 0
      peakVolume.value = 0
    }
  }
  
  const statsInterval = setInterval(updateStats, 100)
  
  onUnmounted(() => {
    clearInterval(statsInterval)
    webcamStore.unbindAudioCanvas()
  })
})
</script>

<style scoped>
.audio-monitor-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.audio-monitor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.audio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.audio-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.audio-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  height: calc(100vh - 200px);
}

.visualization-main {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  overflow: hidden;
}

.single-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.chart-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.chart-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.multi-charts {
  height: 100%;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: 100%;
}

.chart-item {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
}

.chart-item.full-width {
  grid-column: 1 / -1;
}

.audio-canvas {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.audio-canvas.main {
  width: 100%;
  height: 100%;
}

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-card,
.stats-card,
.settings-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.status-card h3,
.stats-card h3,
.settings-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.status-items,
.settings-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item,
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.status-item:last-child,
.setting-item:last-child {
  border-bottom: none;
}

.status-label,
.setting-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.setting-value {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .audio-content {
    grid-template-columns: 1fr;
  }
  
  .info-panel {
    order: -1;
    flex-direction: row;
    gap: 20px;
  }
  
  .status-card,
  .stats-card,
  .settings-card {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .info-panel {
    flex-direction: column;
  }
}
</style>
