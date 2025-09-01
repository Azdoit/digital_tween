<template>
  <div class="layout">
    <!-- 顶部标题栏 -->
    <div class="header">
      <div class="title-container">
                 <h1 class="main-title">东方理工数字孪生智能化平台</h1>
      </div>
      
    </div>

    <div class="main-content">
      <!-- 左侧导航栏 -->
      <div class="sidebar">
        <div class="nav-container">
                     <div class="nav-header">
             <div class="nav-logo">
             </div>
           </div>
                                     <a-menu
           :selected-keys="[activeMenu]"
           mode="vertical"
           show-collapse-button 
           class="nav-menu custom-menu"
           @menu-item-click="handleMenuClick"
         >
            <a-sub-menu key="digital-twin">
              <template #icon><icon-robot /></template>
              <template #title>数字孪生</template>
                                            <a-menu-item key="home">
                 <template #icon><icon-home /></template>
                 未来工厂
               </a-menu-item>
               <a-menu-item key="smart-city" @click="navigateTo('/smart-city')">
                 <template #icon><icon-building /></template>
                 智慧城市
               </a-menu-item>
             </a-sub-menu>
            
            <a-sub-menu key="intelligent-agent">
              <template #icon><icon-robot /></template>
              <template #title>智能体</template>
              <a-menu-item key="3d_generate">
                <template #icon><icon-message /></template>
                三维模型生成
              </a-menu-item>
            </a-sub-menu>
            
            <a-sub-menu key="intelligent-qa">
              <template #icon><icon-robot /></template>
              <template #title>智能问答</template>
              <a-menu-item key="qa">
                <template #icon><icon-message /></template>
                工艺
              </a-menu-item>
              <a-menu-item key="quality">
                <template #icon><icon-check-circle /></template>
                质量
              </a-menu-item>
            </a-sub-menu>
            
                         <a-sub-menu key="application-cases">
              <template #icon><icon-robot/></template>
              <template #title>应用案例</template>
              <a-sub-menu key="baosteel">
                <template #icon><icon-building /></template>
                <template #title>宝钢项目</template>
                <a-menu-item key="baosteel-manyou">漫游展示</a-menu-item>
                <a-menu-item key="baosteel-ai-fire">AI火情监测</a-menu-item>
                <a-menu-item key="baosteel-safety">安全行为监测</a-menu-item>
                <a-menu-item key="baosteel-digital">数字化集成平台</a-menu-item>
                <a-menu-item key="baosteel-oil">无人油库监控</a-menu-item>
                <a-menu-item key="baosteel-steel">钢坯智能追踪</a-menu-item>
                <a-menu-item key="baosteel-splice">视频拼接</a-menu-item>
              </a-sub-menu>
                             <a-sub-menu key="sailisi">
                 <template #title>赛力斯</template>
                 <a-menu-item key="sailisi-main">知识图谱</a-menu-item>
                 <a-menu-item key="sailisi-monitor">监控系统</a-menu-item>
                 <a-menu-item key="sailisi-analytics">数据分析</a-menu-item>
               </a-sub-menu>
              <a-sub-menu key="dongfeng">
                <template #icon><icon-truck /></template>
                <template #title>东风汽车</template>
                <a-menu-item key="dongfeng-production">生产管理</a-menu-item>
                <a-menu-item key="dongfeng-quality">质量控制</a-menu-item>
                <a-menu-item key="dongfeng-logistics">物流系统</a-menu-item>
              </a-sub-menu>
              <a-sub-menu key="gac">
                <template #icon><icon-car /></template>
                <template #title>传祺</template>
                <a-menu-item key="gac-insight">洞察大数据平台</a-menu-item>
              </a-sub-menu>
            </a-sub-menu>
            
              <a-sub-menu key="resource-center">
                <template #icon><icon-robot /></template>
                <template #title>资源中心</template>
                <a-menu-item key="knowledge-base">
                  <template #icon><icon-book /></template>
                  知识库
                </a-menu-item>
                <a-menu-item key="model-library">
                  <template #icon><icon-cube /></template>
                  模型库
                </a-menu-item>
                <a-menu-item key="data-lake">
                  <template #icon><icon-database /></template>
                  数据湖
                </a-menu-item>
              </a-sub-menu>
              
                             <a-sub-menu key="about-platform">
                 <template #icon><icon-robot /></template>
                 <template #title>关于平台</template>
                 <a-menu-item key="platform-architecture">
                   <template #icon><icon-settings /></template>
                   平台架构
                 </a-menu-item>
                 <a-menu-item key="monitor">
                   <template #icon><icon-video-camera /></template>
                   视频监控
                 </a-menu-item>
                 <a-menu-item key="status">
                   <template #icon><icon-dashboard /></template>
                   设备状态
                 </a-menu-item>
                 <a-menu-item key="audio">
                   <template #icon><icon-sound /></template>
                   音频监控
                 </a-menu-item>
                 <a-menu-item key="videos">
                   <template #icon><icon-play-circle /></template>
                   视频播放
                 </a-menu-item>
               </a-sub-menu>
           </a-menu>
          
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="content-area">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  IconRobot,
} from '@arco-design/web-vue/es/icon';
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { webcamStore } from '@/stores/webcamStore.js'

const router = useRouter()
const route = useRoute()
const activeMenu = ref('home')



const isCollapsed = ref(false)
const handleMenuClick = (key) => {
  activeMenu.value = key
  
  if (key === 'home') {
    router.push('/')
  } else if (key === 'smart-city') {
    router.push('/smart-city')
  } else if (key === '3d_generate') {
    router.push('/3d_generate')
  } else if (key === 'qa') {
    router.push('/qa')
  } else if (key === 'quality') {
    router.push('/quality')
  } else if (key === 'knowledge-base') {
    router.push('/knowledge-base')
  } else if (key === 'model-library') {
    router.push('/model-library')
  } else if (key === 'data-lake') {
    router.push('/data-lake')
  } else if (key.startsWith('baosteel-')) {
    // 处理宝钢项目的子菜单
    const videoMap = {
      'baosteel-manyou': 'manyou',
      'baosteel-ai-fire': 'ai-fire',
      'baosteel-safety': 'safety-monitor',
      'baosteel-digital': 'digital-platform',
      'baosteel-oil': 'oil-depot',
      'baosteel-steel': 'steel-tracking',
      'baosteel-splice': 'video-splice'
    }
    const videoId = videoMap[key]
    if (videoId) {
      router.push(`/baosteel?video=${videoId}`)
    }
  } else if (key.startsWith('sailisi-')) {
    // 处理赛力斯的子菜单
    router.push(`/sailisi?module=${key}`)
  } else if (key.startsWith('dongfeng-')) {
    // 处理东风汽车的子菜单
    router.push(`/dongfeng?module=${key}`)
  } else if (key.startsWith('gac-')) {
    // 处理传祺的子菜单
    router.push(`/gac?module=${key}`)
  } else if (key === 'videos') {
     router.push('/videos')
   } else if (key === 'platform-architecture') {
     router.push('/platform-architecture')
   } else {
     router.push(`/${key}`)
   }
}

// 监听路由变化，更新选中的菜单项
watch(() => [route.path, route.query], ([newPath, newQuery]) => {
  if (newPath === '/') {
    activeMenu.value = 'home'
  } else if (newPath === '/baosteel' && newQuery.video) {
    // 根据视频参数设置对应的子菜单项为选中状态
    const videoToMenuKey = {
      'manyou': 'baosteel-manyou',
      'ai-fire': 'baosteel-ai-fire',
      'safety-monitor': 'baosteel-safety',
      'digital-platform': 'baosteel-digital',
      'oil-depot': 'baosteel-oil',
      'steel-tracking': 'baosteel-steel',
      'video-splice': 'baosteel-splice'
    }
    activeMenu.value = videoToMenuKey[newQuery.video] || 'baosteel-manyou'
  } else if (newPath === '/sailisi' && newQuery.module) {
    // 根据模块参数设置对应的赛力斯子菜单项为选中状态
    activeMenu.value = newQuery.module
  } else if (newPath === '/videos') {
    activeMenu.value = 'videos'
  } else {
    const path = newPath.substring(1) // 去掉开头的 '/'
    activeMenu.value = path
  }
}, { immediate: true })



onMounted(() => {
  
})

onUnmounted(() => {
  
})
</script>

<style scoped>
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(33, 150, 243, 0.2);
}

.title-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-title {
  font-size: 28px;
  font-weight: 800;
  color: #000000;
  text-align: center;
}



.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(33, 150, 243, 0.2);
  display: flex;
  flex-direction: column;
}

.nav-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.nav-header {
  padding: 10px 20px;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  color: #000000;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  letter-spacing: 0.5px;
}

.nav-menu {
  flex: 1;
  background: transparent !important;
  border: none;
  padding: 10px 0;
}

/* 强制覆盖Arco Design的默认样式 */
.nav-menu :deep(.arco-menu) {
  background: transparent !important;
}

/* 隐藏所有子菜单，默认不展开 */
.nav-menu :deep(.arco-sub-menu) {
  background: transparent !important;
}

.nav-menu :deep(.arco-sub-menu .arco-menu) {
  display: none !important;
}

/* 鼠标悬停时显示子菜单 */
.nav-menu :deep(.arco-sub-menu:hover .arco-menu) {
  display: block !important;
  position: absolute;
  left: 100%;
  top: 0;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  padding: 8px 0;
}

/* 数字孪生母菜单特殊样式 - 默认展开显示子菜单 */
.nav-menu :deep(.arco-sub-menu[key="digital-twin"]) {
  background: transparent !important;
}

.nav-menu :deep(.arco-sub-menu[key="digital-twin"] .arco-menu) {
  display: block !important;
  position: static !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  min-width: auto !important;
}

/* 关于平台母菜单特殊样式 - 默认展开显示子菜单 */
.nav-menu :deep(.arco-sub-menu[key="about-platform"]) {
  background: transparent !important;
}

.nav-menu :deep(.arco-sub-menu[key="about-platform"] .arco-menu) {
  display: block !important;
  position: static !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  min-width: auto !important;
}

.nav-menu :deep(.arco-menu-item-title) {
  color: #000000 !important;
}

/* 重置所有菜单项的基础样式 - 使用更高优先级 */
.nav-menu :deep(.arco-menu-item),
.nav-menu :deep(.arco-menu-item .arco-menu-item-title) {
  color: #000000 !important;
  margin: 4px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  font-weight: 500;
  background: transparent !important;
  border: none !important;
}

/* 正常状态 - 透明背景 */
.nav-menu :deep(.arco-menu-item:not(.arco-menu-item-selected):not(:hover)),
.nav-menu :deep(.arco-menu-item:not(.arco-menu-item-selected):not(:hover) .arco-menu-item-title) {
  background: transparent !important;
  color: #000000 !important;
}

/* 悬停状态 - 渐变背景 */
.nav-menu :deep(.arco-menu-item:hover),
.nav-menu :deep(.arco-menu-item:hover .arco-menu-item-title) {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%) !important;
  color: #ffffff !important;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

/* 选中状态 - 淡色背景 */
.nav-menu :deep(.arco-menu-item-selected),
.nav-menu :deep(.arco-menu-item-selected .arco-menu-item-title) {
  background: rgba(79, 172, 254, 0.1) !important;
  color: #000000 !important;
}

/* 子菜单项样式 */
.nav-menu :deep(.arco-sub-menu .arco-menu .arco-menu-item) {
  margin: 0 !important;
  border-radius: 0 !important;
  height: 40px !important;
  line-height: 40px !important;
  padding: 0 16px !important;
}

.nav-menu :deep(.arco-sub-menu .arco-menu .arco-menu-item:hover) {
  background: rgba(79, 172, 254, 0.1) !important;
  color: #1976d2 !important;
}

/* 数字孪生子菜单项特殊样式 */
.nav-menu :deep(.arco-sub-menu[key="digital-twin"] .arco-menu .arco-menu-item) {
  margin: 4px 16px !important;
  border-radius: 12px !important;
  height: 48px !important;
  line-height: 48px !important;
  padding: 0 16px !important;
  background: transparent !important;
  color: #000000 !important;
}

.nav-menu :deep(.arco-sub-menu[key="digital-twin"] .arco-menu .arco-menu-item:hover) {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%) !important;
  color: #ffffff !important;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

/* 关于平台子菜单项特殊样式 */
.nav-menu :deep(.arco-sub-menu[key="about-platform"] .arco-menu .arco-menu-item) {
  margin: 4px 16px !important;
  border-radius: 12px !important;
  height: 48px !important;
  line-height: 48px !important;
  padding: 0 16px !important;
  background: transparent !important;
  color: #000000 !important;
}

.nav-menu :deep(.arco-sub-menu[key="about-platform"] .arco-menu .arco-menu-item:hover) {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%) !important;
  color: #ffffff !important;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.nav-menu :deep(.arco-menu-item .arco-icon) {
  font-size: 16px;
  margin-right: 12px;
}

.nav-footer {
  padding: 20px;
  border-top: 1px solid rgba(33, 150, 243, 0.2);
}

.nav-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(79, 172, 254, 0.1);
}

.info-icon {
  font-size: 14px;
  color: #000000;
}

.info-text {
  font-size: 12px;
  color: #000000;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .main-content {
    flex-direction: column;
  }
  
  .nav-container {
    flex-direction: row;
    align-items: center;
    padding: 10px 20px;
  }
  
  .nav-header {
    border-bottom: none;
    border-right: 1px solid rgba(33, 150, 243, 0.2);
    padding: 0 20px 0 0;
  }
  
  .nav-menu {
    flex: 1;
    padding: 0 20px;
  }
  
  .nav-menu :deep(.arco-menu-item) {
    margin: 0 8px;
    height: 40px;
    line-height: 40px;
  }
  
  .nav-footer {
    border-top: none;
    border-left: 1px solid rgba(33, 150, 243, 0.2);
    padding: 0 0 0 20px;
  }
  
  .nav-info {
    flex-direction: row;
    gap: 12px;
  }
  
  .info-item {
    padding: 6px 10px;
  }
  

}

</style>
