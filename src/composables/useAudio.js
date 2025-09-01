import { ref, computed, onMounted, onUnmounted } from 'vue'
import { webcamStore } from '@/stores/webcamStore.js'

export function useAudio() {
  // 音频状态
  const audioStatus = computed(() => webcamStore.audioStatus)
  const audioLoading = computed(() => webcamStore.audioLoading)
  
  // 本地状态
  const currentVolume = ref(0)
  const peakVolume = ref(0)
  
  // 音频控制方法
  const toggleAudio = async () => {
    if (webcamStore.audioStatus === 'online') {
      webcamStore.stopAudio()
      return { success: true, message: '音频已关闭' }
    } else {
      try {
        await webcamStore.startAudio()
        return { success: true, message: '音频已开启' }
      } catch (error) {
        return { success: false, message: error.message }
      }
    }
  }
  
  // 绑定音频画布
  const bindCanvas = (canvas, type = 'main') => {
    if (canvas) {
      webcamStore.bindAudioCanvas(canvas, type)
    }
  }
  
  // 设置可视化类型
  const setVisualizationType = (type) => {
    webcamStore.setVisualizationType(type)
  }
  
  // 获取实时音量数据
  const updateVolumeStats = () => {
    if (webcamStore.audioStatus === 'online' && webcamStore.volumeHistory.length > 0) {
      const latestVolume = webcamStore.volumeHistory[webcamStore.volumeHistory.length - 1]
      currentVolume.value = Math.floor(latestVolume * 100)
      peakVolume.value = Math.max(peakVolume.value, currentVolume.value)
    } else {
      currentVolume.value = 0
    }
  }
  
  // 清理资源
  const cleanup = () => {
    webcamStore.unbindAudioCanvas()
    peakVolume.value = 0
    currentVolume.value = 0
  }
  
  return {
    // 状态
    audioStatus,
    audioLoading,
    currentVolume,
    peakVolume,
    
    // 方法
    toggleAudio,
    bindCanvas,
    setVisualizationType,
    updateVolumeStats,
    cleanup,
    
    // 直接访问 store
    store: webcamStore
  }
}
