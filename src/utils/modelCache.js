import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * 模型缓存管理器
 * 支持GLB/GLTF格式模型的加载、缓存和优化
 */
class ModelCache {
  constructor() {
    this.cache = new Map()
    this.loader = new GLTFLoader()
    this.loadingPromises = new Map()
    this.stats = {
      totalLoaded: 0,
      totalCached: 0,
      cacheHits: 0,
      cacheMisses: 0
    }
  }

  /**
   * 加载模型
   * @param {string} path 模型路径
   * @param {Object} options 加载选项
   * @returns {Promise<THREE.Group>} 加载的模型
   */
  async loadModel(path, options = {}) {
    const {
      enableLOD = true,
      enableOptimization = true,
      enableCaching = true,
      onProgress = null
    } = options

    // 检查缓存
    if (enableCaching && this.cache.has(path)) {
      this.stats.cacheHits++
      console.log(`从缓存加载模型: ${path}`)
      return this.cache.get(path).clone()
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(path)) {
      console.log(`等待模型加载完成: ${path}`)
      return await this.loadingPromises.get(path)
    }

    // 开始加载
    this.stats.cacheMisses++
    const loadingPromise = this._loadModelFromFile(path, options)
    this.loadingPromises.set(path, loadingPromise)

    try {
      const model = await loadingPromise
      
      // 应用优化
      if (enableOptimization) {
        this._optimizeModel(model)
      }

      // 缓存模型
      if (enableCaching) {
        this.cache.set(path, model.clone())
        this.stats.totalCached++
      }

      this.stats.totalLoaded++
      this.loadingPromises.delete(path)
      
      return model

    } catch (error) {
      this.loadingPromises.delete(path)
      throw error
    }
  }

  /**
   * 预加载模型
   * @param {string} path 模型路径
   * @param {Object} options 加载选项
   * @returns {Promise<boolean>} 预加载是否成功
   */
  async preloadModel(path, options = {}) {
    try {
      await this.loadModel(path, options)
      console.log(`模型预加载成功: ${path}`)
      return true
    } catch (error) {
      console.error(`模型预加载失败: ${path}`, error)
      return false
    }
  }

  /**
   * 从文件加载模型
   * @private
   */
  async _loadModelFromFile(path, options) {
    const { onProgress } = options

    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          console.log(`GLB模型加载成功: ${path}`)
          
          // 获取场景或第一个子对象
          const model = gltf.scene || gltf.scenes[0]
          
          // 设置动画
          if (gltf.animations && gltf.animations.length > 0) {
            model.animations = gltf.animations
          }

          // 设置阴影
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })

          resolve(model)
        },
        (progress) => {
          if (onProgress) {
            const percentage = progress.total > 0 
              ? (progress.loaded / progress.total) * 100 
              : 0
            onProgress(percentage, progress)
          }
        },
        (error) => {
          console.error(`GLB模型加载失败: ${path}`, error)
          reject(error)
        }
      )
    })
  }

  /**
   * 优化模型
   * @private
   */
  _optimizeModel(model) {
    model.traverse((child) => {
      if (child.isMesh) {
        // 优化几何体
        if (child.geometry) {
          child.geometry.computeBoundingSphere()
          child.geometry.computeBoundingBox()
        }

        // 优化材质
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach(material => {
            // 启用材质缓存
            material.needsUpdate = false
            
            // 设置合适的渲染参数
            if (material.map) {
              material.map.generateMipmaps = false
              material.map.minFilter = THREE.LinearFilter
            }
          })
        }
      }
    })
  }

  /**
   * 获取缓存信息
   * @returns {Object} 缓存统计信息
   */
  getCacheInfo() {
    return {
      cachedModels: this.cache.size,
      loadingModels: this.loadingPromises.size,
      stats: { ...this.stats },
      memoryUsage: this._calculateMemoryUsage()
    }
  }

  /**
   * 清理缓存
   * @param {string} path 可选，指定要清理的模型路径
   */
  clearCache(path = null) {
    if (path) {
      if (this.cache.has(path)) {
        const model = this.cache.get(path)
        this._disposeModel(model)
        this.cache.delete(path)
        console.log(`清理模型缓存: ${path}`)
      }
    } else {
      // 清理所有缓存
      this.cache.forEach((model, path) => {
        this._disposeModel(model)
      })
      this.cache.clear()
      console.log('清理所有模型缓存')
    }
  }

  /**
   * 释放模型资源
   * @private
   */
  _disposeModel(model) {
    model.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) {
          child.geometry.dispose()
        }
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach(material => {
            if (material.map) material.map.dispose()
            if (material.normalMap) material.normalMap.dispose()
            if (material.roughnessMap) material.roughnessMap.dispose()
            if (material.metalnessMap) material.metalnessMap.dispose()
            material.dispose()
          })
        }
      }
    })
  }

  /**
   * 计算内存使用量（估算）
   * @private
   */
  _calculateMemoryUsage() {
    let totalVertices = 0
    let totalTextures = 0

    this.cache.forEach((model) => {
      model.traverse((child) => {
        if (child.isMesh && child.geometry) {
          const positionAttribute = child.geometry.attributes.position
          if (positionAttribute) {
            totalVertices += positionAttribute.count
          }
        }
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach(material => {
            if (material.map) totalTextures++
            if (material.normalMap) totalTextures++
            if (material.roughnessMap) totalTextures++
            if (material.metalnessMap) totalTextures++
          })
        }
      })
    })

    return {
      estimatedVertices: totalVertices,
      estimatedTextures: totalTextures,
      estimatedMemoryMB: Math.round((totalVertices * 12 + totalTextures * 1024 * 1024) / 1024 / 1024 * 100) / 100
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy() {
    this.clearCache()
    this.loadingPromises.clear()
    this.stats = {
      totalLoaded: 0,
      totalCached: 0,
      cacheHits: 0,
      cacheMisses: 0
    }
  }
}

// 创建单例实例
const modelCache = new ModelCache()

export default modelCache