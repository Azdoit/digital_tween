<template>
  <div class="performance-monitor" v-if="showMonitor">
    <div class="monitor-header">
      <h4 class="monitor-title">
        <icon-computer />
        3D性能监控
      </h4>
      <a-button 
        @click="toggleMonitor" 
        size="mini" 
        type="text"
        class="toggle-btn"
      >
        <icon-minus v-if="expanded" />
        <icon-plus v-else />
      </a-button>
    </div>
    
    <div class="monitor-content" v-if="expanded">
      <!-- 缓存状态 -->
      <div class="monitor-section">
        <div class="section-title">
          <icon-database />
          模型缓存
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">已缓存模型</span>
            <span class="stat-value">{{ cacheInfo.cachedModels }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">缓存大小</span>
            <span class="stat-value">{{ formatBytes(cacheInfo.cacheSize) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">缓存使用率</span>
            <span class="stat-value">{{ Math.round(cacheInfo.cacheUsage) }}%</span>
          </div>
        </div>
        
        <div class="cache-bar">
          <div 
            class="cache-fill" 
            :style="{ width: Math.min(cacheInfo.cacheUsage, 100) + '%' }"
          ></div>
        </div>
      </div>
      
      <!-- 预加载状态 -->
      <div class="monitor-section" v-if="preloadState.isPreloading || preloadState.preloadedModels.size > 0">
        <div class="section-title">
          <icon-loading />
          预加载状态
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">预加载进度</span>
            <span class="stat-value">{{ Math.round(preloadState.preloadProgress) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">已预加载</span>
            <span class="stat-value">{{ preloadState.preloadedModels.size }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">预加载错误</span>
            <span class="stat-value error" v-if="preloadState.preloadErrors.length > 0">
              {{ preloadState.preloadErrors.length }}
            </span>
            <span class="stat-value success" v-else>0</span>
          </div>
        </div>
        
        <div class="preload-bar" v-if="preloadState.isPreloading">
          <div 
            class="preload-fill" 
            :style="{ width: preloadState.preloadProgress + '%' }"
          ></div>
        </div>
      </div>
      
      <!-- 渲染性能 -->
      <div class="monitor-section">
        <div class="section-title">
          <icon-dashboard />
          渲染性能
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">FPS</span>
            <span class="stat-value" :class="getFPSClass(performance.fps)">
              {{ Math.round(performance.fps) }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">渲染时间</span>
            <span class="stat-value">{{ performance.renderTime.toFixed(1) }}ms</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">内存使用</span>
            <span class="stat-value">{{ formatBytes(performance.memoryUsage) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 错误日志 -->
      <div class="monitor-section" v-if="preloadState.preloadErrors.length > 0">
        <div class="section-title">
          <icon-exclamation-circle />
          加载错误
        </div>
        <div class="error-list">
          <div 
            v-for="error in preloadState.preloadErrors" 
            :key="error.path"
            class="error-item"
          >
            <div class="error-model">{{ error.model }}</div>
            <div class="error-message">{{ error.error }}</div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="monitor-actions">
        <a-button-group size="mini" fill>
          <a-button @click="clearCache" type="outline" status="warning">
            <template #icon><icon-delete /></template>
            清理缓存
          </a-button>
          <a-button @click="refreshStats" type="outline">
            <template #icon><icon-refresh /></template>
            刷新统计
          </a-button>
        </a-button-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useGlobalModelPreloader } from '../composables/useModelPreloader'
import modelCache from '../utils/modelCache'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 响应式状态
const showMonitor = ref(props.visible)
const expanded = ref(true)
const performance = reactive({
  fps: 0,
  renderTime: 0,
  memoryUsage: 0,
  lastTime: 0,
  frameCount: 0
})

// 使用预加载器
const preloader = useGlobalModelPreloader()

// 计算属性
const cacheInfo = computed(() => modelCache.getCacheInfo())
const preloadState = computed(() => preloader.preloadState)

// 性能监控
let performanceInterval = null

// 方法
const toggleMonitor = () => {
  expanded.value = !expanded.value
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFPSClass = (fps) => {
  if (fps >= 60) return 'success'
  if (fps >= 30) return 'warning'
  return 'error'
}

const clearCache = () => {
  modelCache.clearCache()
  refreshStats()
}

const refreshStats = () => {
  // 强制刷新缓存信息
  const info = modelCache.getCacheInfo()
  console.log('缓存信息已刷新:', info)
}

const updatePerformance = () => {
  const now = window.performance.now()
  
  if (performance.lastTime > 0) {
    const delta = now - performance.lastTime
    performance.fps = 1000 / delta
    performance.renderTime = delta
  }
  
  performance.lastTime = now
  performance.frameCount++
  
  // 估算内存使用（简化版）
  if (window.performance && window.performance.memory) {
    performance.memoryUsage = window.performance.memory.usedJSHeapSize
  }
}

const startPerformanceMonitoring = () => {
  performanceInterval = setInterval(() => {
    updatePerformance()
  }, 1000) // 每秒更新一次
}

const stopPerformanceMonitoring = () => {
  if (performanceInterval) {
    clearInterval(performanceInterval)
    performanceInterval = null
  }
}

// 生命周期
onMounted(() => {
  startPerformanceMonitoring()
})

onUnmounted(() => {
  stopPerformanceMonitoring()
})

// 暴露控制方法
defineExpose({
  show: () => { showMonitor.value = true },
  hide: () => { showMonitor.value = false },
  toggle: () => { showMonitor.value = !showMonitor.value }
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 320px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
}

.monitor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.monitor-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #e8f4fd;
  font-size: 14px;
  font-weight: 600;
}

.toggle-btn {
  color: #b8c5d1 !important;
  padding: 4px !important;
}

.monitor-content {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.monitor-section {
  margin-bottom: 16px;
}

.monitor-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4facfe;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-label {
  display: block;
  color: #b8c5d1;
  font-size: 11px;
  margin-bottom: 2px;
}

.stat-value {
  display: block;
  color: #e8f4fd;
  font-weight: 600;
  font-size: 13px;
}

.stat-value.success {
  color: #52c41a;
}

.stat-value.warning {
  color: #faad14;
}

.stat-value.error {
  color: #ff4d4f;
}

.cache-bar,
.preload-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.cache-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  transition: width 0.3s ease;
}

.preload-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
  transition: width 0.3s ease;
}

.error-list {
  max-height: 120px;
  overflow-y: auto;
}

.error-item {
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 6px;
}

.error-model {
  color: #ff7875;
  font-weight: 600;
  font-size: 11px;
  margin-bottom: 2px;
}

.error-message {
  color: #b8c5d1;
  font-size: 10px;
  line-height: 1.3;
}

.monitor-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 滚动条样式 */
.monitor-content::-webkit-scrollbar,
.error-list::-webkit-scrollbar {
  width: 4px;
}

.monitor-content::-webkit-scrollbar-track,
.error-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.monitor-content::-webkit-scrollbar-thumb,
.error-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.monitor-content::-webkit-scrollbar-thumb:hover,
.error-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-monitor {
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    width: auto;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>




