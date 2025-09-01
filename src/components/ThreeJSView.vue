<template>
  <div class="threejs-container">
    <div ref="container" class="threejs-canvas"></div>
    <div class="threejs-overlay">
      <div class="loading" v-if="loading">
        <a-spin size="large" />
        <div class="loading-text">{{ loadingText }}</div>
        <div class="loading-progress" v-if="loadingProgress > 0">
          <a-progress 
            :percent="loadingProgress" 
            size="small" 
            :show-text="false"
            stroke-color="linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)"
          />
          <div class="progress-text">{{ Math.round(loadingProgress) }}%</div>
        </div>
      </div>
      
      <!-- 模型控制面板 -->
      <div class="model-controls" v-if="!loading && model">
        <a-button-group size="small">
          <a-button @click="resetCamera" type="outline">
            <template #icon><icon-refresh /></template>
            重置视角
          </a-button>
          <a-button @click="toggleWireframe" type="outline">
            <template #icon><icon-eye /></template>
            {{ showWireframe ? '实体' : '线框' }}
          </a-button>
          <a-button @click="toggleAnimation" type="outline" v-if="animations.length > 0">
            <template #icon><icon-play-arrow v-if="!isAnimating" /><icon-pause v-else /></template>
            {{ isAnimating ? '暂停' : '播放' }}
          </a-button>
          <a-button @click="togglePerformanceMonitor" type="outline">
            <template #icon><icon-computer /></template>
            性能
          </a-button>
        </a-button-group>
      </div>
      
      <!-- 缓存状态指示器 -->
      <div class="cache-info" v-if="!loading">
        <a-tooltip content="模型缓存状态">
          <div class="cache-indicator" :class="{ 'cached': isModelCached }">
            <icon-database />
          </div>
        </a-tooltip>
      </div>
    </div>
    
    <!-- 性能监控组件 -->
    <ModelPerformanceMonitor 
      ref="performanceMonitor"
      :visible="showPerformanceMonitor"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import modelCache from '../utils/modelCache'
import { useGlobalModelPreloader } from '../composables/useModelPreloader'
import ModelPerformanceMonitor from './ModelPerformanceMonitor.vue'

// 响应式状态
const container = ref(null)
const loading = ref(true)
const loadingText = ref('初始化3D场景...')
const loadingProgress = ref(0)
const model = ref(null)
const isModelCached = ref(false)
const showWireframe = ref(false)
const isAnimating = ref(false)
const animations = ref([])
const showPerformanceMonitor = ref(false)

// ThreeJS 对象
let scene, camera, renderer, controls, clock
let animationId = null
let animationMixer = null
let currentAnimationAction = null

// 组件引用
const performanceMonitor = ref(null)

// 模型路径
const MODEL_PATH = '/mox.glb'

// 使用全局预加载器
const preloader = useGlobalModelPreloader()

// 计算属性
const cacheInfo = computed(() => modelCache.getCacheInfo())

// 监听预加载状态
watch(() => preloader.preloadState.isPreloading, (isPreloading) => {
  if (isPreloading && loading.value) {
    loadingText.value = '模型预加载中...'
  }
})

watch(() => preloader.preloadState.preloadProgress, (progress) => {
  if (preloader.preloadState.isPreloading && loading.value) {
    loadingProgress.value = progress
    loadingText.value = `模型预加载中... ${Math.round(progress)}%`
  }
})

const initThreeJS = async () => {
  loadingText.value = '初始化3D场景...'
  
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  scene.fog = new THREE.Fog(0xffffff, 100, 1000) // 添加雾效
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    45,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    2000
  )
  camera.position.set(10, 10, 10) // 调整默认相机位置以适应模型
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance"
  })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  container.value.appendChild(renderer.domElement)
  
  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 5
  controls.maxDistance = 200
  controls.maxPolarAngle = Math.PI * 0.9
  controls.autoRotate = false
  controls.autoRotateSpeed = 0.5
  
  // 添加光源
  setupLighting()
  
  // // 创建地面
  // createGround()
  
  // 时钟
  clock = new THREE.Clock()
  
  // 加载GLB模型
  await loadGLBModel()
  
  // 开始动画
  animate()
  
  // 窗口大小调整
  window.addEventListener('resize', onWindowResize)
}

// 设置全局光照
const setupLighting = () => {
  // 强环境光 - 提供基础全局照明
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  
  // 半球光 - 模拟天空和地面的反射光
  const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x404040, 0.6)
  scene.add(hemisphereLight)
  
  // 多方向点光源 - 提供均匀的全方位照明
  const pointLight1 = new THREE.PointLight(0xffffff, 0.4, 200)
  pointLight1.position.set(50, 50, 50)
  scene.add(pointLight1)
  
  const pointLight2 = new THREE.PointLight(0xffffff, 0.4, 200)
  pointLight2.position.set(-50, 50, -50)
  scene.add(pointLight2)
  
  const pointLight3 = new THREE.PointLight(0xffffff, 0.4, 200)
  pointLight3.position.set(50, -50, -50)
  scene.add(pointLight3)
  
  const pointLight4 = new THREE.PointLight(0xffffff, 0.4, 200)
  pointLight4.position.set(-50, -50, 50)
  scene.add(pointLight4)
}

// 加载GLB模型
const loadGLBModel = async () => {
  try {
    // 检查模型是否已预加载
    const isPreloaded = preloader.isModelPreloaded(MODEL_PATH)
    const cacheInfo = modelCache.getCacheInfo()
    isModelCached.value = cacheInfo.cachedModels > 0 || isPreloaded
    
    if (isPreloaded) {
      loadingText.value = '从缓存加载模型...'
    } else {
      loadingText.value = '正在加载3D模型...'
      loadingProgress.value = 0
    }
    
    const glbModel = await modelCache.loadModel(MODEL_PATH, {
      enableLOD: true,
      enableOptimization: true,
      enableCaching: true,
      onProgress: (percentage, progress) => {
        if (!isPreloaded) {
          loadingProgress.value = percentage
          loadingText.value = `加载模型中... ${Math.round(percentage)}%`
        }
      }
    })
    
    // 设置模型
    model.value = glbModel
    
    // 保持模型原始大小和位置，只调整相机
    const box = new THREE.Box3().setFromObject(glbModel)
    
    // 检查动画
    if (glbModel.animations && glbModel.animations.length > 0) {
      animations.value = glbModel.animations
      animationMixer = new THREE.AnimationMixer(glbModel)
      
      // 播放第一个动画
      if (animations.value.length > 0) {
        currentAnimationAction = animationMixer.clipAction(animations.value[0])
        currentAnimationAction.play()
        isAnimating.value = true
      }
    }
    
    scene.add(glbModel)
    
    // 更新相机位置
    const boundingSphere = box.getBoundingSphere(new THREE.Sphere())
    const distance = boundingSphere.radius * 0.8
    camera.position.set(distance, distance, distance)
    controls.target.set(0, 0, 0)
    controls.update()
    
    loadingText.value = '模型加载完成'
    setTimeout(() => {
      loading.value = false
    }, 500)
    
    console.log('GLB模型加载成功', glbModel)
    
  } catch (error) {
    console.error('GLB模型加载失败:', error)
    loadingText.value = '模型加载失败，使用默认场景'
    
    // 回退到默认的box
    createFallbackScene()
    
    setTimeout(() => {
  loading.value = false
    }, 1000)
  }
}

// 创建回退场景（当模型加载失败时）
const createFallbackScene = () => {
  const boxGeometry = new THREE.BoxGeometry(10, 10, 10)
  const boxMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x4facfe,
    transparent: true,
    opacity: 0.8
  })
  const box = new THREE.Mesh(boxGeometry, boxMaterial)
  box.position.set(0, 5, 0)
  box.castShadow = true
  box.receiveShadow = true
  scene.add(box)
  
  // 添加边框
  const edges = new THREE.EdgesGeometry(boxGeometry)
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00f2fe })
  const wireframe = new THREE.LineSegments(edges, lineMaterial)
  wireframe.position.set(0, 5, 0)
  scene.add(wireframe)
}


// 控制方法
const resetCamera = () => {
  if (model.value) {
    const box = new THREE.Box3().setFromObject(model.value)
    const boundingSphere = box.getBoundingSphere(new THREE.Sphere())
    const distance = boundingSphere.radius * 0.2
    
    camera.position.set(distance, distance * 0.8, distance)
    camera.lookAt(boundingSphere.center)
    controls.target.copy(boundingSphere.center)
    controls.update()
  } else {
    camera.position.set(10, 10, 10)
    camera.lookAt(0, 0, 0)
    controls.target.set(0, 0, 0)
    controls.update()
  }
}

const toggleWireframe = () => {
  showWireframe.value = !showWireframe.value
  
  if (model.value) {
    model.value.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach(material => {
          material.wireframe = showWireframe.value
        })
      }
    })
  }
}

const toggleAnimation = () => {
  if (!animationMixer || !currentAnimationAction) return
  
  if (isAnimating.value) {
    currentAnimationAction.paused = true
    isAnimating.value = false
  } else {
    currentAnimationAction.paused = false
    isAnimating.value = true
  }
}

const togglePerformanceMonitor = () => {
  showPerformanceMonitor.value = !showPerformanceMonitor.value
  if (performanceMonitor.value) {
    if (showPerformanceMonitor.value) {
      performanceMonitor.value.show()
    } else {
      performanceMonitor.value.hide()
    }
  }
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  
  const delta = clock.getDelta()
  
  // 更新动画混合器
  if (animationMixer) {
    animationMixer.update(delta)
  }
  
  // 更新控制器
  controls.update()
  
  // 渲染场景
  renderer.render(scene, camera)
}

const onWindowResize = () => {
  if (container.value && camera && renderer) {
    camera.aspect = container.value.clientWidth / container.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  }
}

onMounted(async () => {
  await initThreeJS()
})

onUnmounted(() => {
  // 清理动画
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  // 清理动画混合器
  if (animationMixer) {
    animationMixer.stopAllAction()
    animationMixer.uncacheRoot(animationMixer.getRoot())
  }
  
  // 清理场景
  if (scene) {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) {
          child.geometry.dispose()
        }
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach(material => material.dispose())
        }
      }
    })
    scene.clear()
  }
  
  // 清理渲染器
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
  }
  
  // 清理控制器
  if (controls) {
    controls.dispose()
  }
  
  // 移除事件监听器
  window.removeEventListener('resize', onWindowResize)
  
  console.log('ThreeJS 组件已清理')
})
</script>

<style scoped>
.threejs-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.threejs-canvas {
  width: 100%;
  height: 100%;
}

.threejs-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.8);
  padding: 32px;
  border-radius: 12px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 300px;
}

.loading-text {
  color: #e8f4fd;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.loading-progress {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-text {
  color: #b8c5d1;
  font-size: 12px;
  text-align: center;
}

.model-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cache-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  pointer-events: auto;
}

.cache-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b8c5d1;
  transition: all 0.3s ease;
  cursor: pointer;
}

.cache-indicator:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.cache-indicator.cached {
  color: #4facfe;
  border-color: #4facfe;
  box-shadow: 0 0 10px rgba(79, 172, 254, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .model-controls {
    top: 10px;
    right: 10px;
    left: 10px;
    display: flex;
    justify-content: center;
  }
  
  .cache-info {
    bottom: 10px;
    right: 10px;
  }
  
  .loading {
    padding: 24px;
    min-width: 280px;
    margin: 20px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.model-controls,
.cache-info {
  animation: fadeIn 0.5s ease-out;
}
</style>
