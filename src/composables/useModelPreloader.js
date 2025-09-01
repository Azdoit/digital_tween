import { ref, reactive, readonly } from 'vue'
import modelCache from '../utils/modelCache'

// 全局状态
const preloadState = reactive({
  isPreloading: false,
  preloadProgress: 0,
  preloadedModels: new Set(),
  preloadErrors: []
})

// 需要预加载的模型列表
const MODELS_TO_PRELOAD = [
  {
    path: '/mox.glb',
    priority: 1, // 优先级，1为最高
    name: '主要3D模型'
  }
  // 可以在这里添加更多模型
]

/**
 * 模型预加载组合式函数
 */
export function useModelPreloader() {
  
  /**
   * 开始预加载所有模型
   */
  const startPreloading = async () => {
    if (preloadState.isPreloading) {
      console.log('预加载已在进行中')
      return
    }

    preloadState.isPreloading = true
    preloadState.preloadProgress = 0
    preloadState.preloadErrors = []
    
    console.log('开始预加载3D模型...')
    
    // 按优先级排序
    const sortedModels = [...MODELS_TO_PRELOAD].sort((a, b) => a.priority - b.priority)
    
    const totalModels = sortedModels.length
    let completedModels = 0
    
    for (const modelInfo of sortedModels) {
      try {
        console.log(`预加载模型: ${modelInfo.name}`)
        
        await modelCache.preloadModel(modelInfo.path, {
          enableLOD: true,
          enableOptimization: true,
          enableCaching: true,
          onProgress: (percentage) => {
            // 计算总体进度
            const baseProgress = (completedModels / totalModels) * 100
            const currentProgress = (percentage / totalModels)
            preloadState.preloadProgress = Math.min(baseProgress + currentProgress, 100)
          }
        })
        
        preloadState.preloadedModels.add(modelInfo.path)
        completedModels++
        
        console.log(`模型预加载完成: ${modelInfo.name}`)
        
      } catch (error) {
        console.error(`模型预加载失败: ${modelInfo.name}`, error)
        preloadState.preloadErrors.push({
          model: modelInfo.name,
          path: modelInfo.path,
          error: error.message
        })
      }
    }
    
    preloadState.preloadProgress = 100
    preloadState.isPreloading = false
    
    const successCount = preloadState.preloadedModels.size
    const errorCount = preloadState.preloadErrors.length
    
    console.log(`模型预加载完成: 成功 ${successCount}, 失败 ${errorCount}`)
    
    // 打印缓存信息
    const cacheInfo = modelCache.getCacheInfo()
    console.log('模型缓存状态:', cacheInfo)
  }
  
  /**
   * 检查模型是否已预加载
   */
  const isModelPreloaded = (modelPath) => {
    return preloadState.preloadedModels.has(modelPath)
  }
  
  /**
   * 获取预加载状态
   */
  const getPreloadState = () => {
    return {
      ...preloadState,
      cacheInfo: modelCache.getCacheInfo()
    }
  }
  
  /**
   * 手动预加载单个模型
   */
  const preloadModel = async (modelPath, options = {}) => {
    try {
      await modelCache.preloadModel(modelPath, {
        enableLOD: true,
        enableOptimization: true,
        enableCaching: true,
        ...options
      })
      
      preloadState.preloadedModels.add(modelPath)
      return true
    } catch (error) {
      console.error(`手动预加载模型失败: ${modelPath}`, error)
      return false
    }
  }
  
  /**
   * 清理预加载状态
   */
  const clearPreloadState = () => {
    preloadState.preloadedModels.clear()
    preloadState.preloadErrors = []
    preloadState.preloadProgress = 0
    preloadState.isPreloading = false
  }
  
  return {
    // 状态
    preloadState: readonly(preloadState),
    
    // 方法
    startPreloading,
    isModelPreloaded,
    getPreloadState,
    preloadModel,
    clearPreloadState
  }
}

// 创建全局实例
let globalPreloader = null

/**
 * 获取全局预加载器实例
 */
export function useGlobalModelPreloader() {
  if (!globalPreloader) {
    globalPreloader = useModelPreloader()
  }
  return globalPreloader
}

/**
 * 自动启动预加载（在应用启动时调用）
 */
export async function initModelPreloader() {
  const preloader = useGlobalModelPreloader()
  
  // 延迟一点时间开始预加载，让应用先完成初始化
  setTimeout(() => {
    preloader.startPreloading()
  }, 1000)
  
  return preloader
}
