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
            <div class="nav-logo"></div>
          </div>
          <!-- 自定义悬浮菜单 -->
          <div class="custom-nav-menu">
            <!-- 数字孪生 -->
            <div
              class="nav-item"
              :class="{ active: ['home', 'smart-city'].includes(activeMenu) }"
            >
              <div class="nav-item-title">
                <icon-robot class="nav-icon" />
                <span>数字孪生</span>
              </div>
              <div class="nav-submenu">
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === 'home' }"
                  @click="handleMenuClick('home')"
                >
                  <icon-robot class="nav-icon" />
                  <span>未来工厂</span>
                </div>
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === 'smart-city' }"
                  @click="handleMenuClick('smart-city')"
                >
                  <icon-robot class="nav-icon" />
                  <span>智慧城市</span>
                </div>
              </div>
            </div>

            <!-- 智能体 -->
            <div
              class="nav-item"
              :class="{ active: activeMenu === '3d_generate' }"
            >
              <div class="nav-item-title">
                <icon-robot class="nav-icon" />
                <span>智能体</span>
              </div>
              <div class="nav-submenu">
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === '3d_generate' }"
                  @click="handleMenuClick('3d_generate')"
                >
                  <icon-robot class="nav-icon" />
                  <span>三维模型生成</span>
                </div>
              </div>
            </div>

            <!-- 智能问答 -->
            <div
              class="nav-item"
              :class="{ active: ['qa', 'quality'].includes(activeMenu) }"
            >
              <div class="nav-item-title">
                <icon-robot class="nav-icon" />
                <span>智能问答</span>
              </div>
              <div class="nav-submenu">
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === 'qa' }"
                  @click="handleMenuClick('qa')"
                >
                  <icon-robot class="nav-icon" />
                  <span>工艺</span>
                </div>
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === 'quality' }"
                  @click="handleMenuClick('quality')"
                >
                  <icon-robot class="nav-icon" />
                  <span>质量</span>
                </div>
              </div>
            </div>

            <!-- 应用案例 -->
            <div
              class="nav-item"
              :class="{
                active:
                  activeMenu.includes('baosteel') ||
                  activeMenu.includes('sailisi') ||
                  activeMenu.includes('dongfeng') ||
                  activeMenu.includes('gac'),
              }"
            >
              <div class="nav-item-title">
                <icon-robot class="nav-icon" />
                <span>应用案例</span>
              </div>
              <div class="nav-submenu">
                <!-- 宝钢项目 -->
                <div class="nav-submenu-group">
                  <div class="nav-submenu-group-title">
                    <icon-robot class="nav-icon" />
                    <span>宝钢项目</span>
                  </div>
                  <div class="nav-submenu-group-items">
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'baosteel-manyou' }"
                      @click="handleMenuClick('baosteel-manyou')"
                    >
                      漫游展示
                    </div>
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'baosteel-ai-fire' }"
                      @click="handleMenuClick('baosteel-ai-fire')"
                    >
                      AI火情监测
                    </div>
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'baosteel-safety' }"
                      @click="handleMenuClick('baosteel-safety')"
                    >
                      安全行为监测
                    </div>
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'baosteel-digital' }"
                      @click="handleMenuClick('baosteel-digital')"
                    >
                      数字化集成平台
                    </div>
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'baosteel-oil' }"
                      @click="handleMenuClick('baosteel-oil')"
                    >
                      无人油库监控
                    </div>
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'baosteel-steel' }"
                      @click="handleMenuClick('baosteel-steel')"
                    >
                      钢坯智能追踪
                    </div>
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'baosteel-splice' }"
                      @click="handleMenuClick('baosteel-splice')"
                    >
                      视频拼接
                    </div>
                  </div>
                </div>

                <!-- 赛力斯 -->
                <div class="nav-submenu-group">
                  <div class="nav-submenu-group-title">
                    <icon-robot class="nav-icon" />
                    <span>赛力斯</span>
                  </div>
                  <div class="nav-submenu-group-items">
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'sailisi-main' }"
                      @click="handleMenuClick('sailisi-main')"
                    >
                      知识图谱
                    </div>
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'sailisi-monitor' }"
                      @click="handleMenuClick('sailisi-monitor')"
                    >
                      监控系统
                    </div>
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'sailisi-analytics' }"
                      @click="handleMenuClick('sailisi-analytics')"
                    >
                      数据分析
                    </div>
                  </div>
                </div>

                <!-- 东风汽车 -->
                <div class="nav-submenu-group">
                  <div class="nav-submenu-group-title">
                    <icon-robot class="nav-icon" />
                    <span>东风汽车</span>
                  </div>
                  <div class="nav-submenu-group-items">
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'dongfeng-production' }"
                      @click="handleMenuClick('dongfeng-production')"
                    >
                      生产管理
                    </div>
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'dongfeng-quality' }"
                      @click="handleMenuClick('dongfeng-quality')"
                    >
                      质量控制
                    </div>
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'dongfeng-logistics' }"
                      @click="handleMenuClick('dongfeng-logistics')"
                    >
                      物流系统
                    </div>
                  </div>
                </div>

                <!-- 传祺 -->
                <div class="nav-submenu-group">
                  <div class="nav-submenu-group-title">
                    <icon-robot class="nav-icon" />
                    <span>传祺</span>
                  </div>
                  <div class="nav-submenu-group-items">
                    <div
                      class="nav-submenu-item"
                      :class="{ active: activeMenu === 'gac-insight' }"
                      @click="handleMenuClick('gac-insight')"
                    >
                      洞察大数据平台
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 资源中心 -->
            <div
              class="nav-item"
              :class="{
                active: [
                  'knowledge-base',
                  'model-library',
                  'data-lake',
                ].includes(activeMenu),
              }"
            >
              <div class="nav-item-title">
                <icon-robot class="nav-icon" />
                <span>资源中心</span>
              </div>
              <div class="nav-submenu">
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === 'knowledge-base' }"
                  @click="handleMenuClick('knowledge-base')"
                >
                  <icon-robot class="nav-icon" />
                  <span>知识库</span>
                </div>
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === 'model-library' }"
                  @click="handleMenuClick('model-library')"
                >
                  <icon-robot class="nav-icon" />
                  <span>模型库</span>
                </div>
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === 'data-lake' }"
                  @click="handleMenuClick('data-lake')"
                >
                  <icon-robot class="nav-icon" />
                  <span>数据湖</span>
                </div>
              </div>
            </div>

            <!-- 关于平台 -->
            <div
              class="nav-item"
              :class="{
                active: [
                  'platform-architecture',
                  'monitor',
                  'status',
                  'audio',
                  'videos',
                ].includes(activeMenu),
              }"
            >
              <div class="nav-item-title">
                <icon-robot class="nav-icon" />
                <span>关于平台</span>
              </div>
              <div class="nav-submenu">
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === 'platform-architecture' }"
                  @click="handleMenuClick('platform-architecture')"
                >
                  <icon-robot class="nav-icon" />
                  <span>平台架构</span>
                </div>
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === 'monitor' }"
                  @click="handleMenuClick('monitor')"
                >
                  <icon-robot class="nav-icon" />
                  <span>视频监控</span>
                </div>
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === 'status' }"
                  @click="handleMenuClick('status')"
                >
                  <icon-robot class="nav-icon" />
                  <span>设备状态</span>
                </div>
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === 'audio' }"
                  @click="handleMenuClick('audio')"
                >
                  <icon-robot class="nav-icon" />
                  <span>音频监控</span>
                </div>
                <div
                  class="nav-submenu-item"
                  :class="{ active: activeMenu === 'videos' }"
                  @click="handleMenuClick('videos')"
                >
                  <icon-robot class="nav-icon" />
                  <span>视频播放</span>
                </div>
              </div>
            </div>
          </div>
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
import { IconRobot } from "@arco-design/web-vue/es/icon";
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { webcamStore } from "@/stores/webcamStore.js";

const router = useRouter();
const route = useRoute();
const activeMenu = ref("home");

const isCollapsed = ref(false);
const handleMenuClick = (key) => {
  activeMenu.value = key;

  if (key === "home") {
    router.push("/");
  } else if (key === "smart-city") {
    router.push("/smart-city");
  } else if (key === "3d_generate") {
    router.push("/3d_generate");
  } else if (key === "qa") {
    router.push("/qa");
  } else if (key === "quality") {
    router.push("/quality");
  } else if (key === "knowledge-base") {
    router.push("/knowledge-base");
  } else if (key === "model-library") {
    router.push("/model-library");
  } else if (key === "data-lake") {
    router.push("/data-lake");
  } else if (key.startsWith("baosteel-")) {
    // 处理宝钢项目的子菜单
    const videoMap = {
      "baosteel-manyou": "manyou",
      "baosteel-ai-fire": "ai-fire",
      "baosteel-safety": "safety-monitor",
      "baosteel-digital": "digital-platform",
      "baosteel-oil": "oil-depot",
      "baosteel-steel": "steel-tracking",
      "baosteel-splice": "video-splice",
    };
    const videoId = videoMap[key];
    if (videoId) {
      router.push(`/baosteel?video=${videoId}`);
    }
  } else if (key.startsWith("sailisi-")) {
    // 处理赛力斯的子菜单
    router.push(`/sailisi?module=${key}`);
  } else if (key.startsWith("dongfeng-")) {
    // 处理东风汽车的子菜单
    router.push(`/dongfeng?module=${key}`);
  } else if (key.startsWith("gac-")) {
    // 处理传祺的子菜单
    router.push(`/gac?module=${key}`);
  } else if (key === "videos") {
    router.push("/videos");
  } else if (key === "platform-architecture") {
    router.push("/platform-architecture");
  } else {
    router.push(`/${key}`);
  }
};

// 监听路由变化，更新选中的菜单项
watch(
  () => [route.path, route.query],
  ([newPath, newQuery]) => {
    if (newPath === "/") {
      activeMenu.value = "home";
    } else if (newPath === "/baosteel" && newQuery.video) {
      // 根据视频参数设置对应的子菜单项为选中状态
      const videoToMenuKey = {
        manyou: "baosteel-manyou",
        "ai-fire": "baosteel-ai-fire",
        "safety-monitor": "baosteel-safety",
        "digital-platform": "baosteel-digital",
        "oil-depot": "baosteel-oil",
        "steel-tracking": "baosteel-steel",
        "video-splice": "baosteel-splice",
      };
      activeMenu.value = videoToMenuKey[newQuery.video] || "baosteel-manyou";
    } else if (newPath === "/sailisi" && newQuery.module) {
      // 根据模块参数设置对应的赛力斯子菜单项为选中状态
      activeMenu.value = newQuery.module;
    } else if (newPath === "/videos") {
      activeMenu.value = "videos";
    } else {
      const path = newPath.substring(1); // 去掉开头的 '/'
      activeMenu.value = path;
    }
  },
  { immediate: true }
);

onMounted(() => {});

onUnmounted(() => {});
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
  z-index: 20; /* 提升侧边栏的层级 */
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

/* 自定义悬浮菜单样式 */
.custom-nav-menu {
  flex: 1;
  padding: 10px 0;
}

.nav-item {
  position: relative;
  margin: 4px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.nav-item-title {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  color: #000000;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.nav-item-title:hover {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: #ffffff;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.nav-item.active .nav-item-title {
  background: rgba(79, 172, 254, 0.1);
  color: #000000;
}

.nav-icon {
  font-size: 16px;
  margin-right: 12px;
}

/* 子菜单样式 */
.nav-submenu {
  position: absolute;
  left: 100%;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  max-width: 400px;
  z-index: 1000;
  padding: 8px;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  border: 1px solid rgba(79, 172, 254, 0.2);
}

.nav-item:hover .nav-submenu {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.nav-submenu-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  color: #000000;
  font-size: 13px;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin: 2px 0;
}

.nav-submenu-item:hover {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: #ffffff;
  transform: translateX(4px);
}

.nav-submenu-item.active {
  background: rgba(79, 172, 254, 0.15);
  color: #1976d2;
  font-weight: 600;
}

.nav-submenu-item .nav-icon {
  font-size: 14px;
  margin-right: 8px;
}

/* 应用案例特殊样式 - 支持分组 */
.nav-submenu-group {
  margin: 4px 0;
}

.nav-submenu-group-title {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  color: #666;
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid rgba(79, 172, 254, 0.1);
  margin-bottom: 4px;
}

.nav-submenu-group-title .nav-icon {
  font-size: 12px;
  margin-right: 6px;
}

.nav-submenu-group-items {
  padding-left: 8px;
}

.nav-submenu-group-items .nav-submenu-item {
  font-size: 12px;
  padding: 8px 10px;
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

  .custom-nav-menu {
    flex: 1;
    padding: 0 20px;
  }

  .nav-item {
    margin: 0 8px;
  }

  .nav-item-title {
    height: 40px;
    line-height: 40px;
    padding: 0 12px;
  }

  .nav-submenu {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    max-width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
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
