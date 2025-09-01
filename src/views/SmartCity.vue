<template>
  <div class="smart-city-page">
    <div class="page-header">
      <h2>智慧城市</h2>
      <p>数字孪生城市模型展示</p>
    </div>
    
    <div class="page-content">
      <div class="content-main">
        <div class="model-container">
          <div id="three-container" class="three-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// 响应式数据
const rotationSpeed = ref(1)
const scale = ref(1)
const autoRotate = ref(true)

// Three.js 相关变量
let scene, camera, renderer, controls, model
let animationId

onMounted(async () => {
  // 等待 DOM 完全渲染后再初始化
  await nextTick()
  initThreeJS()
  loadCityModel()
  animate()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
})

const initThreeJS = () => {
  const container = document.getElementById('three-container')
  
  // 安全检查：确保容器元素存在
  if (!container) {
    console.error('Three.js container not found!')
    return
  }
  
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff) // 改为白色背景，提高对比度
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 5, 10)
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)
  
  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.autoRotateSpeed = rotationSpeed.value
  
  // 添加光源 - 超强光照效果
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0) // 超强环境光
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5) // 超强方向光
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)
  
  // 添加多个点光源包围模型
  const pointLight1 = new THREE.PointLight(0xffffff, 1.0, 100)
  pointLight1.position.set(10, 10, 10)
  scene.add(pointLight1)
  
  const pointLight2 = new THREE.PointLight(0xffffff, 1.0, 100)
  pointLight2.position.set(-10, 10, -10)
  scene.add(pointLight2)
  
  const pointLight3 = new THREE.PointLight(0xffffff, 1.0, 100)
  pointLight3.position.set(10, -10, 10)
  scene.add(pointLight3)
  
  const pointLight4 = new THREE.PointLight(0xffffff, 1.0, 100)
  pointLight4.position.set(-10, -10, -10)
  scene.add(pointLight4)
  
  // 添加顶部光源
  const topLight = new THREE.DirectionalLight(0xffffff, 1.2)
  topLight.position.set(0, 20, 0)
  scene.add(topLight)
  
  // 添加半球光
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x888888, 0.8)
  scene.add(hemisphereLight)
  
  // 地面已移除
  
  // 监听窗口大小变化
  window.addEventListener('resize', onWindowResize)
}

const loadCityModel = () => {
  const loader = new GLTFLoader()
  
  loader.load(
    '/city_model.glb',
    (gltf) => {
      model = gltf.scene
      
                    // 设置模型属性 - 强制替换黑色材质
       model.traverse((child) => {
         if (child.isMesh) {
           child.castShadow = true
           child.receiveShadow = true
           
           // 强制替换黑色材质为可见颜色
           if (child.material) {
             // 检测是否为黑色材质
             if (child.material.color && 
                 child.material.color.r < 0.2 && 
                 child.material.color.g < 0.2 && 
                 child.material.color.b < 0.2) {
               
               // 创建新的材质，使用可见的颜色
               const newMaterial = new THREE.MeshLambertMaterial({
                 color: 0x666666, // 深灰色，比黑色更容易看见
                 transparent: true,
                 opacity: 0.9,
                 emissive: 0x333333, // 添加自发光
                 emissiveIntensity: 0.2
               })
               
               // 替换材质
               child.material = newMaterial
             } else {
               // 对于非黑色材质，增强其可见性
               child.material.emissive = new THREE.Color(0x111111)
               child.material.emissiveIntensity = 0.1
             }
             
             child.material.needsUpdate = true
           }
         }
       })
      
      // 调整模型位置和大小
      model.scale.set(scale.value, scale.value, scale.value)
      model.position.y = 0
      
      scene.add(model)
      
      // 调整相机位置以适应模型
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = camera.fov * (Math.PI / 180)
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
      
      camera.position.set(center.x, center.y + maxDim / 2, center.z + cameraZ)
      camera.lookAt(center)
      controls.target.copy(center)
      controls.update()
      
      console.log('城市模型加载成功')
    },
    (progress) => {
      console.log('加载进度:', (progress.loaded / progress.total * 100) + '%')
    },
    (error) => {
      console.error('加载城市模型失败:', error)
    }
  )
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  
  if (controls) {
    controls.update()
  }
  
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

const onWindowResize = () => {
  const container = document.getElementById('three-container')
  
  // 安全检查：确保容器元素和相机、渲染器存在
  if (!container || !camera || !renderer) {
    return
  }
  
  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}

const updateRotation = () => {
  if (controls) {
    controls.autoRotateSpeed = rotationSpeed.value
  }
}

const updateScale = () => {
  if (model) {
    model.scale.set(scale.value, scale.value, scale.value)
  }
}

const resetCamera = () => {
  if (model && controls) {
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = camera.fov * (Math.PI / 180)
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
    
    camera.position.set(center.x, center.y + maxDim / 2, center.z + cameraZ)
    camera.lookAt(center)
    controls.target.copy(center)
    controls.update()
  }
}

const toggleAutoRotate = () => {
  autoRotate.value = !autoRotate.value
  if (controls) {
    controls.autoRotate = autoRotate.value
  }
}
</script>

<style scoped>
.smart-city-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.page-header {
  padding: 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #1d2129;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.page-content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.content-main {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.model-container {
  height: 100%;
  width: 100%;
}

.three-container {
  height: 100%;
  width: 100%;
}



/* 响应式设计 */
@media (max-width: 1200px) {
  .page-content {
    padding: 12px;
  }
}
</style>
