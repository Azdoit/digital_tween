<template>
  <div class="wrap">
         <h2>三维模型生成（文生 / 图生）</h2>

    <div class="row">
      <label><input type="radio" value="text" v-model="mode" /> 文生3D</label>
      <label><input type="radio" value="image" v-model="mode" /> 图生3D</label>
    </div>

    <!-- 文生3D模式 -->
    <div v-if="mode==='text'" class="text-mode">
      <div class="card">
        <input v-model="prompt" class="ipt" placeholder="例如：一只穿宇航服的橘猫" />
      </div>

      <div class="row">
        <label>
          输出格式：
          <select v-model="resultFormat" class="ipt ipt-small">
            <option>GLB</option><option>OBJ</option><option>STL</option>
            <option>USDZ</option><option>FBX</option><option>MP4</option>
          </select>
        </label>
        <label class="chk"><input type="checkbox" v-model="enablePBR" /> 启用PBR</label>

        <button class="btn" :disabled="submitting" @click="submit">
          {{ submitting ? '提交中...' : '开始生成' }}
        </button>
      </div>

      <div v-if="jobId" class="row">
        <div>任务ID：{{ jobId }}</div>
        <div>状态：{{ status }}</div>
        <div v-if="estimatedTotalSec" class="eta-info">
          <div>预计总时长：{{ formatTime(estimatedTotalSec) }}</div>
          <div v-if="estimatedRemainingSec !== null" class="remaining-time">
            剩余时间：{{ formatTime(estimatedRemainingSec) }}
          </div>
          <div v-if="durationSec !== null" class="elapsed-time">
            已用时间：{{ formatTime(durationSec) }}
          </div>
        </div>
        <button class="btn btn-small" @click="clearTaskState" style="margin-left: auto;">
          清除任务状态
        </button>
      </div>
      <div v-if="error" class="err">错误：{{ error }}</div>

      <!-- 本地模型上传与预览 -->
      <div class="card">
        <div class="row" style="justify-content: space-between; width: 100%;">
          <div>
            <strong>本地模型预览：</strong>
            <span class="tip">支持 GLB / GLTF / OBJ / STL / FBX</span>
          </div>
          <input type="file" :accept="acceptModelTypes" @change="onPickLocalModel" />
        </div>
        <div v-if="localModelName" class="row">
          <div>已选择：{{ localModelName }}</div>
          <button class="btn" @click="clearLocalModel">清除</button>
        </div>
      </div>

      <!-- three.js 预览区：始终渲染，避免未挂载时加载 -->
      <div class="result" v-show="showViewer">
        <div class="row" v-if="status==='DONE' && fileUrl">
          <div>文件类型：{{ fileType }}</div>
          <!-- 直接使用本地 /files/... 地址，无需代理 -->
          <a :href="fileUrl" target="_blank">下载结果</a>
          <button class="btn" @click="downloadToPC" v-if="fileUrl">保存到我的电脑</button>
        </div>

        <div ref="viewerEl" class="viewer">
          <div v-if="loading3D" class="loading">模型加载中… {{ Math.round(loadProgress*100) }}%</div>
          <div v-if="loadErr" class="err">模型加载失败：{{ loadErr }}</div>
          <div v-if="!loading3D && !hasAnyModel" class="placeholder">请选择/生成一个模型以预览</div>
        </div>
      </div>
    </div>

    <!-- 图生3D模式 - 左右布局 -->
    <div v-else class="image-mode">
      <div class="image-mode-controls">
        <div class="row">
          <label>
            输出格式：
            <select v-model="resultFormat" class="ipt ipt-small">
              <option>GLB</option><option>OBJ</option><option>STL</option>
              <option>USDZ</option><option>FBX</option><option>MP4</option>
            </select>
          </label>
          <label class="chk"><input type="checkbox" v-model="enablePBR" /> 启用PBR</label>

          <button class="btn" :disabled="submitting" @click="submit">
            {{ submitting ? '提交中...' : '开始生成' }}
          </button>
        </div>

        <div v-if="jobId" class="row">
          <div>任务ID：{{ jobId }}</div>
          <div>状态：{{ status }}</div>
          <div v-if="estimatedTotalSec" class="eta-info">
            <div>预计总时长：{{ formatTime(estimatedTotalSec) }}</div>
            <div v-if="estimatedRemainingSec !== null" class="remaining-time">
              剩余时间：{{ formatTime(estimatedRemainingSec) }}
            </div>
            <div v-if="durationSec !== null" class="elapsed-time">
              已用时间：{{ formatTime(durationSec) }}
            </div>
          </div>
          <button class="btn btn-small" @click="clearTaskState" style="margin-left: auto;">
            清除任务状态
          </button>
        </div>
        <div v-if="error" class="err">错误：{{ error }}</div>
      </div>

      <div class="image-mode-layout">
        <!-- 左侧：上传的图像 -->
        <div class="left-panel">
          <div class="panel-header">
            <h3>输入图像</h3>
            <input type="file" accept="image/*" @change="onPickImage" class="file-input" />
          </div>
          <div class="image-container">
            <div v-if="!preview" class="upload-placeholder">
              <div class="upload-icon">📷</div>
              <div class="upload-text">点击上方按钮选择图片</div>
            </div>
            <img v-else :src="preview" class="uploaded-image" />
          </div>
        </div>

                 <!-- 右侧：生成的模型 -->
         <div class="right-panel">
           <div class="panel-header">
             <h3>生成结果</h3>
             <div v-if="status==='DONE' && fileUrl" class="result-actions">
               <a :href="fileUrl" target="_blank" class="btn btn-small">下载</a>
               <button class="btn btn-small" @click="downloadToPC">保存</button>
             </div>
           </div>
           <div class="model-container">
             <div ref="viewerElImage" class="viewer">
               <div v-if="loading3D" class="loading">模型加载中… {{ Math.round(loadProgress*100) }}%</div>
               <div v-if="loadErr" class="err">模型加载失败：{{ loadErr }}</div>

               <div v-if="status === 'DONE' && fileUrl && !hasAnyModel" class="placeholder">
                 模型生成完成，正在加载预览...
               </div>
             </div>
           </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

// three.js
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

// ================== 基础配置 ==================
const BASE = 'http://localhost:3002' // 如用 Vite 代理到 3002，可设为 '' 并配 proxy

// ================== 业务状态 ==================
const mode = ref('text')
const prompt = ref('')
const resultFormat = ref('GLB')
const enablePBR = ref(false)

const submitting = ref(false)
const preview = ref('')
const imageFile = ref(null)

const jobId = ref('')
const status = ref('')
const fileUrl = ref('')  // 现在会存本地 /files/... 的完整地址（BASE + localUrl）
const fileType = ref('')
const error = ref('')
// 预计时间相关变量
const estimatedTotalSec = ref(null)
const estimatedRemainingSec = ref(null)
const durationSec = ref(null)
let timer = null

// 任务持久化相关
const STORAGE_KEY = 'ai3d_task_state'

// 本地模型
const acceptModelTypes = '.glb,.gltf,.obj,.stl,.fbx'
const localModelName = ref('')
const localModelLoaded = ref(false)

// 预览显示控制
const showViewer = computed(() => (status.value === 'DONE' && !!fileUrl.value) || localModelLoaded.value)
const hasAnyModel = computed(() => !!currentModel)

// ================== three.js 相关 ==================
const viewerEl = ref(null)        // 文生3D模式的viewer
const viewerElImage = ref(null)   // 图生3D模式的viewer
let renderer, scene, camera, controls, animationId
let currentModel = null
let objectUrlForBlob = ''  // 远程/本地文件 fetch 后的 blob URL
let objectUrlLocal = ''    // 本地上传文件的 blob URL
const loading3D = ref(false)
const loadProgress = ref(0)
const loadErr = ref('')
let disposeInitialized = false

const initThree = () => {
  // 根据当前模式选择正确的viewer元素
  const currentViewer = mode.value === 'image' ? viewerElImage.value : viewerEl.value
  console.log('initThree调用:', { mode: mode.value, currentViewer: !!currentViewer, scene: !!scene })
  if (!currentViewer || scene) {
    console.log('initThree跳过:', { currentViewer: !!currentViewer, scene: !!scene })
    return
  }
  const width = currentViewer.clientWidth || 800
  const height = currentViewer.clientHeight || 520
  console.log('初始化Three.js:', { width, height, mode: mode.value })

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  currentViewer.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf7f7f8)

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(1.8, 1.2, 2.4)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 灯光
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.1)
  hemi.position.set(0, 1, 0)
  scene.add(hemi)
  const dir = new THREE.DirectionalLight(0xffffff, 1.0)
  dir.position.set(5, 10, 7)
  scene.add(dir)

  // 无地面圆盘（已移除）

  const onResize = () => {
    const currentViewer = mode.value === 'image' ? viewerElImage.value : viewerEl.value
    if (!currentViewer || !camera || !renderer) return
    const w = currentViewer.clientWidth || 800
    const h = currentViewer.clientHeight || 520
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', onResize)

  const tick = () => {
    if (controls && renderer && scene && camera) {
      controls.update()
      renderer.render(scene, camera)
    }
    animationId = requestAnimationFrame(tick)
  }
  tick()

  if (!disposeInitialized) {
    initThree.dispose = () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animationId)
      controls && controls.dispose()
      if (renderer) {
        renderer.dispose()
        if (renderer.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      disposeObject(scene)
      scene = null; camera = null; controls = null; renderer = null
    }
    disposeInitialized = true
  }
}

function disposeObject(obj) {
  if (!obj || !obj.traverse) return
  obj.traverse((child) => {
    if (child.isMesh) {
      child.geometry && child.geometry.dispose?.()
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((m) => {
          m.map && m.map.dispose?.()
          m.normalMap && m.normalMap.dispose?.()
          m.roughnessMap && m.roughnessMap.dispose?.()
          m.metalnessMap && m.metalnessMap.dispose?.()
          m.emissiveMap && m.emissiveMap.dispose?.()
          m.dispose?.()
        })
      }
    }
  })
}

function clearSceneModel() {
  if (!scene) return
  if (currentModel) {
    scene.remove(currentModel)
    disposeObject(currentModel)
    currentModel = null
  }
  // 重置相关状态
  loadErr.value = ''
  loading3D.value = false
  loadProgress.value = 0
}

function fitModel(root) {
  const box = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const scale = 1.2 / maxDim
  root.scale.setScalar(scale)
  root.position.sub(center.multiplyScalar(scale))

  const dist = 2.5
  camera.position.set(dist, dist * 0.8, dist * 1.1)
  controls.target.set(0, 0.5 * size.y * scale, 0)
  controls.update()
}

// 组件挂载后确保先初始化 three
onMounted(async () => {
  await nextTick()
  
  // 恢复任务状态
  const restored = restoreTaskState()
  if (restored) {
    console.log('已恢复任务状态')
  }
  
  // 根据初始模式选择正确的viewer
  if (mode.value === 'image' && viewerElImage.value) {
    // 图生3D模式
    initThree()
  } else if (mode.value === 'text' && viewerEl.value) {
    // 文生3D模式
    initThree()
  }
  
  // 添加页面可见性监听器
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// ===== 从 URL（同源 /files/...）加载 GLB/GLTF =====
async function loadGLBFromUrl(url) {
  console.log('开始加载GLB模型:', url, '当前模式:', mode.value)
  // 确保在正确的viewer中初始化
  if (mode.value === 'image' && !viewerElImage.value) {
    console.log('等待图生3D模式viewer挂载...')
    await nextTick()
  }
  initThree()
  if (!scene) { 
    console.error('Three.js场景未初始化')
    loadErr.value = '渲染器未初始化'; 
    return 
  }
  console.log('Three.js场景初始化成功，开始加载模型')

  clearSceneModel()
  loadErr.value = ''
  loading3D.value = true
  loadProgress.value = 0
  localModelLoaded.value = false

  try {
    const res = await fetch(url)
    if (!res.ok) {
      let msg = ''
      try { msg = await res.text() } catch {}
      throw new Error(`下载失败: ${res.status} ${msg}`)
    }
    const blob = await res.blob()
    if (objectUrlForBlob) URL.revokeObjectURL(objectUrlForBlob)
    objectUrlForBlob = URL.createObjectURL(blob)

    const loader = new GLTFLoader()
    await new Promise((resolve, reject) => {
      loader.load(
        objectUrlForBlob,
        (gltf) => {
          if (!scene) initThree()
          if (!scene) return reject(new Error('渲染器未初始化'))
          currentModel = gltf.scene
          scene.add(currentModel)
          fitModel(currentModel)
          resolve()
        },
        (ev) => {
          if (ev.lengthComputable) loadProgress.value = ev.loaded / ev.total
          else loadProgress.value = 0.6
        },
        (err) => reject(err)
      )
    })
  } catch (e) {
    loadErr.value = e.message || String(e)
  } finally {
    loading3D.value = false
    loadProgress.value = 1
  }
}

// ===== 本地模型加载（GLB/GLTF/OBJ/STL/FBX）=====
async function loadLocalModel(file) {
  if (!file) return
  initThree()
  if (!scene) { loadErr.value = '渲染器未初始化'; return }

  clearSceneModel()
  loadErr.value = ''
  loading3D.value = true
  loadProgress.value = 0
  localModelLoaded.value = false

  if (objectUrlLocal) URL.revokeObjectURL(objectUrlLocal)
  objectUrlLocal = URL.createObjectURL(file)

  const ext = (file.name.split('.').pop() || '').toLowerCase()
  const finish = () => { loading3D.value = false; loadProgress.value = 1; localModelLoaded.value = true }

  try {
    if (ext === 'glb' || ext === 'gltf') {
      const loader = new GLTFLoader()
      loader.load(
        objectUrlLocal,
        (gltf) => {
          if (!scene) initThree()
          if (!scene) { loadErr.value = '渲染器未初始化'; return finish() }
          currentModel = gltf.scene
          scene.add(currentModel)
          fitModel(currentModel)
          finish()
        },
        (ev) => { loadProgress.value = ev.lengthComputable ? (ev.loaded / ev.total) : 0.6 },
        (err) => { loadErr.value = String(err); finish() }
      )
    } else if (ext === 'obj') {
      const loader = new OBJLoader()
      loader.load(
        objectUrlLocal,
        (obj) => {
          if (!scene) initThree()
          if (!scene) { loadErr.value = '渲染器未初始化'; return finish() }
          currentModel = obj
          scene.add(currentModel)
          fitModel(currentModel)
          finish()
        },
        undefined,
        (err) => { loadErr.value = String(err); finish() }
      )
    } else if (ext === 'stl') {
      const loader = new STLLoader()
      loader.load(
        objectUrlLocal,
        (geom) => {
          if (!scene) initThree()
          if (!scene) { loadErr.value = '渲染器未初始化'; return finish() }
          const mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.1, roughness: 0.9 })
          const mesh = new THREE.Mesh(geom, mat)
          currentModel = mesh
          scene.add(currentModel)
          fitModel(currentModel)
          finish()
        },
        undefined,
        (err) => { loadErr.value = String(err); finish() }
      )
    } else if (ext === 'fbx') {
      const loader = new FBXLoader()
      loader.load(
        objectUrlLocal,
        (obj) => {
          if (!scene) initThree()
          if (!scene) { loadErr.value = '渲染器未初始化'; return finish() }
          currentModel = obj
          scene.add(currentModel)
          fitModel(currentModel)
          finish()
        },
        undefined,
        (err) => { loadErr.value = String(err); finish() }
      )
    } else {
      loadErr.value = `不支持的模型格式：.${ext}`
      finish()
    }
  } catch (e) {
    loadErr.value = e.message || String(e)
    finish()
  }
}

// 选择本地模型
function onPickLocalModel(e) {
  const f = e.target.files?.[0]
  if (!f) return
  localModelName.value = f.name
  loadLocalModel(f)
}

// 清除本地模型
function clearLocalModel() {
  localModelName.value = ''
  localModelLoaded.value = false
  clearSceneModel()
  if (objectUrlLocal) { URL.revokeObjectURL(objectUrlLocal); objectUrlLocal = '' }
}

// fileUrl/fileType 变化时触发三维加载（现在直接加载本地URL）
watch([() => fileUrl.value, () => fileType.value], async ([url, type]) => {
  if (!url) return
  const ok = ['GLB', 'GLTF'].includes((type || '').toUpperCase())
  if (!ok) return
  await nextTick()
  loadGLBFromUrl(url)
})

// 监听模式变化，重新初始化Three.js
watch(mode, async (newMode) => {
  if (newMode === 'image') {
    // 切换到图生3D模式时，等待DOM更新后重新初始化
    await nextTick()
    if (viewerElImage.value) {
      // 清除之前的渲染器
      if (renderer) {
        renderer.dispose()
        if (renderer.domElement?.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
      }
      // 重置状态
      scene = null
      camera = null
      controls = null
      disposeInitialized = false
      // 重新初始化
      initThree()
    }
  }
})

// 页面可见性变化监听
const handleVisibilityChange = () => {
  if (!document.hidden && jobId.value && status.value && status.value !== 'DONE' && status.value !== 'FAIL') {
    console.log('页面重新可见，检查任务状态')
    // 重新开始轮询
    poll()
  }
}

// 卸载清理
onUnmounted(() => {
  clearInterval(timer)
  if (initThree.dispose) initThree.dispose()
  if (objectUrlForBlob) URL.revokeObjectURL(objectUrlForBlob)
  if (objectUrlLocal) URL.revokeObjectURL(objectUrlLocal)
  
  // 保存当前状态（如果页面刷新或切换）
  if (jobId.value) {
    saveTaskState()
  }
  
  // 移除页面可见性监听器
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// ================== 工具函数 ==================
// 保存任务状态到localStorage
function saveTaskState() {
  const taskState = {
    jobId: jobId.value,
    status: status.value,
    fileUrl: fileUrl.value,
    fileType: fileType.value,
    error: error.value,
    estimatedTotalSec: estimatedTotalSec.value,
    estimatedRemainingSec: estimatedRemainingSec.value,
    durationSec: durationSec.value,
    mode: mode.value,
    prompt: prompt.value,
    resultFormat: resultFormat.value,
    enablePBR: enablePBR.value,
    // 保存图像相关数据
    imageFile: imageFile.value ? {
      name: imageFile.value.name,
      size: imageFile.value.size,
      type: imageFile.value.type,
      lastModified: imageFile.value.lastModified
    } : null,
    preview: preview.value,
    timestamp: Date.now()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(taskState))
}

// 从localStorage恢复任务状态
function restoreTaskState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return false
    
    const taskState = JSON.parse(saved)
    const now = Date.now()
    const timeDiff = now - taskState.timestamp
    
    // 如果任务状态太旧（超过1小时），则不恢复
    if (timeDiff > 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY)
      return false
    }
    
    // 恢复状态
    jobId.value = taskState.jobId || ''
    status.value = taskState.status || ''
    fileUrl.value = taskState.fileUrl || ''
    fileType.value = taskState.fileType || ''
    error.value = taskState.error || ''
    estimatedTotalSec.value = taskState.estimatedTotalSec || null
    estimatedRemainingSec.value = taskState.estimatedRemainingSec || null
    durationSec.value = taskState.durationSec || null
    mode.value = taskState.mode || 'text'
    prompt.value = taskState.prompt || ''
    resultFormat.value = taskState.resultFormat || 'GLB'
    enablePBR.value = taskState.enablePBR || false
    
    // 恢复图像相关数据
    if (taskState.preview) {
      preview.value = taskState.preview
    }
    
    // 如果有正在进行的任务，重新开始轮询
    if (jobId.value && status.value && status.value !== 'DONE' && status.value !== 'FAIL') {
      console.log('恢复任务状态，重新开始轮询:', jobId.value, status.value)
      poll()
    }
    
    return true
  } catch (e) {
    console.error('恢复任务状态失败:', e)
    localStorage.removeItem(STORAGE_KEY)
    return false
  }
}

// 清除任务状态
function clearTaskState() {
  localStorage.removeItem(STORAGE_KEY)
  // 清除图像相关状态
  imageFile.value = null
  preview.value = ''
}

// 格式化时间显示
function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return '--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  if (mins > 0) {
    return `${mins}分${secs}秒`
  } else {
    return `${secs}秒`
  }
}

// ================== 业务逻辑：提交 / 轮询 ==================
function onPickImage(e) {
  const f = e.target.files?.[0]
  if (!f) return
  imageFile.value = f
  const reader = new FileReader()
  reader.onload = () => {
    preview.value = reader.result
    // 清除原来的3D模型
    clearSceneModel()
    // 清除相关的任务状态
    jobId.value = ''
    status.value = ''
    fileUrl.value = ''
    fileType.value = ''
    error.value = ''
    estimatedTotalSec.value = null
    estimatedRemainingSec.value = null
    durationSec.value = null
    // 图像选择后立即保存状态
    saveTaskState()
  }
  reader.readAsDataURL(f)
}

async function submit() {
  error.value = ''; jobId.value = ''; status.value = ''; fileUrl.value = ''; fileType.value = ''; loadErr.value = ''
  // 重置预计时间相关变量
  estimatedTotalSec.value = null
  estimatedRemainingSec.value = null
  durationSec.value = null
  submitting.value = true
  try {
    if (mode.value === 'text') {
      const r = await fetch(`${BASE}/api/ai3d/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.value?.trim(), resultFormat: resultFormat.value, enablePBR: enablePBR.value })
      })
      const data = await r.json(); if (!r.ok) throw new Error(data.detail || data.error || 'submit failed')
      jobId.value = data.jobId
    } else {
      const fd = new FormData()
      fd.append('resultFormat', resultFormat.value)
      fd.append('enablePBR', String(enablePBR.value))
      if (!imageFile.value) throw new Error('请先选择图片')
      fd.append('image', imageFile.value)
      const r = await fetch(`${BASE}/api/ai3d/submit-form`, { method: 'POST', body: fd })
      const data = await r.json(); if (!r.ok) throw new Error(data.detail || data.error || 'submit failed')
      jobId.value = data.jobId
    }
    
    // 保存任务状态
    saveTaskState()
    
    poll()
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}

async function poll() {
  clearInterval(timer)
  timer = setInterval(async () => {
    try {
      const r = await fetch(`${BASE}/api/ai3d/status?jobId=${jobId.value}`)
      const data = await r.json(); if (!r.ok) throw new Error(data.detail || data.error || 'query failed')
      status.value = data.Status
      
      // 更新预计时间信息
      estimatedTotalSec.value = data.EstimatedTotalSec || null
      estimatedRemainingSec.value = data.EstimatedRemainingSec || null
      durationSec.value = data.DurationSec || null
      
      // 保存更新后的状态
      saveTaskState()
      
      if (data.Status === 'DONE') {
        clearInterval(timer)
        const arr = data.ResultFile3Ds || []
        if (arr.length) {
          const first = arr[0]
          fileType.value = first.Type
          // 先让后端把 COS 链接下载到本地，拿到 /files/... 的本地 URL
          const saveRes = await fetch(`${BASE}/api/ai3d/save?jobId=${jobId.value}&url=${encodeURIComponent(first.Url)}`)
          const saveData = await saveRes.json()
          if (!saveRes.ok) throw new Error(saveData.detail || 'save failed')
          // 展示地址使用同源本地文件
          fileUrl.value = `${BASE}${saveData.localUrl}`
          
          // 保存最终完成状态
          saveTaskState()
        }
      }
      if (data.Status === 'FAIL') { 
        clearInterval(timer); 
        error.value = data.ErrorMessage || '任务失败'
        // 保存失败状态
        saveTaskState()
      }
    } catch (e) { 
      clearInterval(timer); 
      error.value = e.message
      // 保存错误状态
      saveTaskState()
    }
  }, 3000)
}

const canPreview = computed(() => fileUrl.value && ['GLB','GLTF'].includes(fileType.value?.toUpperCase()))

// 下载到本地电脑
async function downloadToPC() {
  try {
    if (!fileUrl.value) return
    const res = await fetch(fileUrl.value)
    if (!res.ok) throw new Error(`下载失败: ${res.status}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const name = (fileUrl.value.split('/').pop() || 'model.glb').split('?')[0]
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (e) {
    loadErr.value = e.message || String(e)
  }
}
</script>

<style scoped>
.wrap { 
  padding: 16px; 
  color: #000; /* 确保所有文字为黑色 */
  max-width: 1200px;
  margin: 0 auto; /* 居中显示 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平居中 */
}
.row { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  margin: 12px 0; 
  flex-wrap: wrap; 
  color: #000; /* 确保文字为黑色 */
  justify-content: center; /* 水平居中 */
  width: 100%;
}
.card { 
  padding: 12px; 
  border: 1px solid #eee; 
  border-radius: 8px; 
  color: #000; /* 确保文字为黑色 */
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
.ipt { 
  padding: 8px; 
  width: 420px; 
  max-width: 90%; 
  border: 1px solid #ddd; 
  border-radius: 6px; 
  color: #000; /* 确保输入框文字为黑色 */
}
.ipt-small { 
  width: 120px; 
}
.chk { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  color: #000; /* 确保文字为黑色 */
}
.btn { 
  padding: 8px 16px; 
  background: #111; 
  color: #fff; /* 按钮文字保持白色 */
  border-radius: 6px; 
  border: none; 
  cursor: pointer; 
}
.thumb { 
  width: 120px; 
  height: 120px; 
  object-fit: cover; 
  border: 1px solid #ddd; 
  border-radius: 6px; 
}
.tip { 
  color: #333; /* 改为深色 */
  margin-left: 6px; 
  font-size: 12px; 
}
.err { 
  color: #e11d48; /* 错误信息保持红色 */
}
.result { 
  margin-top: 16px; 
  display: grid; 
  gap: 8px; 
  color: #000; /* 确保文字为黑色 */
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}
.viewer { 
  margin-top: 8px; 
  width: 800px; 
  height: 520px; 
  background: #fafafa; 
  position: relative; 
}

/* 图生3D模式下的viewer样式 */
.image-mode .viewer {
  width: 100%;
  height: 100%;
  margin-top: 0;
}
.loading { 
  position: absolute; 
  left: 12px; 
  top: 8px; 
  font-size: 13px; 
  color: #000; /* 改为黑色 */
}
.placeholder { 
  position: absolute; 
  left: 12px; 
  top: 8px; 
  font-size: 13px; 
  color: #000; /* 改为黑色 */
}

/* 确保所有标签和文字都是黑色 */
label {
  color: #000;
}

h2 {
  color: #000;
  text-align: center;
  margin-bottom: 20px;
}

div {
  color: #000;
}

/* 链接颜色 */
a {
  color: #0066cc;
}

a:hover {
  color: #0052a3;
}

/* 预计时间样式 */
.eta-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #007bff;
  font-size: 14px;
}

.remaining-time {
  color: #28a745;
  font-weight: 500;
}

.elapsed-time {
  color: #6c757d;
}

/* 图生3D模式样式 */
.image-mode {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.image-mode-controls {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.image-mode-layout {
  display: flex;
  gap: 20px;
  height: 600px;
}

.left-panel,
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.panel-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.file-input {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
}

.image-container,
.model-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  position: relative;
  min-height: 0; /* 确保flex子元素可以收缩 */
  overflow: hidden; /* 防止图像溢出容器 */
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .image-mode-layout {
    flex-direction: column;
    height: auto;
  }
  
  .left-panel,
  .right-panel {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .image-mode-layout {
    gap: 16px;
  }
  
  .left-panel,
  .right-panel {
    height: 300px;
  }
  
  .panel-header {
    padding: 8px 12px;
  }
  
  .panel-header h3 {
    font-size: 14px;
  }
}
</style>

