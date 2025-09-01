<template>
  <div class="dashboard">
    <div class="panels-container">
      <!-- 左侧面板 - 智慧能碳管理 -->
      <div class="panel energy-panel">
        <div class="panel-header">
          <h3><icon-bulb /> 智慧能碳管理</h3>
        </div>
        <div class="panel-content">
          <div class="energy-grid">
            <div class="energy-item">
              <div class="energy-icon">
                <icon-thunderbolt />
              </div>
              <div class="energy-info">
                <div class="energy-value">1,234.5</div>
                <div class="energy-label">用电总量 (kWh)</div>
              </div>
            </div>
            <div class="energy-item">
              <div class="energy-icon">
                <icon-droplet />
              </div>
              <div class="energy-info">
                <div class="energy-value">567.8</div>
                <div class="energy-label">用水总量 (m³)</div>
              </div>
            </div>
            <div class="energy-item">
              <div class="energy-icon">
                <icon-trophy />
              </div>
              <div class="energy-info">
                <div class="energy-value">#2</div>
                <div class="energy-label">耗电排名</div>
              </div>
            </div>
            <div class="energy-item">
              <div class="energy-icon">
                <icon-leaf />
              </div>
              <div class="energy-info">
                <div class="energy-value">89.2</div>
                <div class="energy-label">碳排放总量 (t)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间面板 - Three.js 3D可视化 -->
      <div class="panel threejs-panel">
        <div class="panel-header">
          <h3><icon-cube /> Three.js 3D可视化</h3>
        </div>
        <div class="panel-content">
          <ThreeJSView />
        </div>
      </div>

      <!-- 右侧面板 - 设备健康诊断 -->
      <div class="panel device-panel">
        <div class="panel-header">
          <h3><icon-heart /> 设备健康诊断</h3>
        </div>
        <div class="panel-content">
          <div class="device-status">
            <div 
              v-for="device in devices" 
              :key="device.id"
              class="device-item"
            >
              <div 
                class="device-indicator" 
                :class="device.status"
                :style="{ '--border-width': device.health + '%' }"
              >
                <span class="device-name">{{ device.name }}</span>
                <span class="device-health">{{ device.health }}%</span>
              </div>
            </div>
          </div>
          
          <div class="inventory-section">
            <h4><icon-package /> 备用品库存状态</h4>
            <div class="inventory-grid">
              <div 
                v-for="item in inventory" 
                :key="item.id"
                class="inventory-item"
              >
                <span class="inventory-name">{{ item.name }}</span>
                <div class="inventory-level">
                  <a-progress 
                    :percent="item.level" 
                    :color="getInventoryColor(item.level)"
                    size="small"
                    :show-text="false"
                  />
                  <span class="inventory-text">{{ item.level }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部面板 - 生产管理 -->
    <div class="panel production-panel">
      <div class="panel-header">
        <h3><icon-settings /> 生产管理</h3>
      </div>
      <div class="panel-content">
        <div class="production-grid">
          <div class="production-item">
            <div class="production-icon">
              <icon-play-circle />
            </div>
            <div class="production-info">
              <div class="production-value">12</div>
              <div class="production-label">运行设备</div>
            </div>
          </div>
          <div class="production-item">
            <div class="production-icon">
              <icon-pause-circle />
            </div>
            <div class="production-info">
              <div class="production-value">3</div>
              <div class="production-label">待机设备</div>
            </div>
          </div>
          <div class="production-item">
            <div class="production-icon">
              <icon-exclamation-circle />
            </div>
            <div class="production-info">
              <div class="production-value">1</div>
              <div class="production-label">故障设备</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ThreeJSView from '@/components/ThreeJSView.vue'
import { dashboardAPI } from '@/utils/api'

// 设备数据
const devices = ref([])
const loading = ref(false)

// 从API获取设备数据
const fetchDevices = async () => {
  try {
    loading.value = true
    const data = await dashboardAPI.getDevices()
    devices.value = data
  } catch (error) {
    console.error('获取设备数据失败:', error)
    // 如果API失败，使用默认数据
    devices.value = [
      { id: 1, name: '设备1', health: 95, status: 'healthy' },
      { id: 2, name: '设备2', health: 87, status: 'warning' },
      { id: 3, name: '设备3', health: 92, status: 'healthy' }
    ]
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchDevices()
})

// 库存数据
const inventory = ref([
  { id: 1, name: '轴承', level: 85 },
  { id: 2, name: '电机', level: 45 },
  { id: 3, name: '传感器', level: 92 },
  { id: 4, name: '控制器', level: 78 }
])

const getInventoryColor = (level) => {
  if (level >= 80) return '#00f2fe'
  if (level >= 60) return '#ffa726'
  return '#ff6b6b'
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.panels-container {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 20px;
  height: calc(100vh - 200px);
}

.panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.panel-header {
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #e8f4fd;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-content {
  padding: 20px;
  height: calc(100% - 60px);
  overflow-y: auto;
}

/* 能碳管理面板 */
.energy-grid {
  display: grid;
  gap: 16px;
}

.energy-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.energy-item:hover {
  background: rgba(79, 172, 254, 0.1);
  transform: translateX(4px);
}

.energy-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 8px;
  font-size: 18px;
  color: #ffffff;
}

.energy-info {
  flex: 1;
}

.energy-value {
  font-size: 18px;
  font-weight: 600;
  color: #4facfe;
  margin-bottom: 4px;
}

.energy-label {
  font-size: 12px;
  color: #8b9bb4;
}

/* Three.js面板 */
.threejs-panel {
  position: relative;
}

.threejs-panel .panel-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 设备面板 */
.device-status {
  margin-bottom: 24px;
}

.device-item {
  margin-bottom: 12px;
}

.device-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.device-indicator::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--border-width, 12px);
  background: transparent;
  z-index: 0;
}

.device-indicator.healthy::before {
  background: #00f2fe !important;
}

.device-indicator.healthy {
  background: rgba(0, 242, 254, 0.1) !important;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.15) !important;
}

.device-indicator.healthy .device-health {
  color: #ffffff !important;
}

.device-indicator.warning::before {
  background: #ffa726 !important;
}

.device-indicator.warning {
  background: rgba(255, 167, 38, 0.1) !important;
  box-shadow: 0 0 20px rgba(255, 167, 38, 0.15) !important;
}

.device-indicator.warning .device-health {
  color: #ffffff !important;
}

.device-indicator.danger::before {
  background: #ff6b6b !important;
}

.device-indicator.danger {
  background: rgba(255, 107, 107, 0.1) !important;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.15) !important;
}

.device-indicator.danger .device-health {
  color: #ffffff !important;
}

.device-name {
  font-weight: 500;
  color: #ffffff;
  position: relative;
  z-index: 2;
}

.device-health {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  position: relative;
  z-index: 2;
}

.inventory-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #e8f4fd;
  display: flex;
  align-items: center;
  gap: 6px;
}

.inventory-grid {
  display: grid;
  gap: 12px;
}

.inventory-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.inventory-name {
  font-size: 12px;
  color: #b8c5d1;
  flex: 1;
}

.inventory-level {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.inventory-text {
  font-size: 12px;
  color: #8b9bb4;
  min-width: 30px;
}

/* 生产管理面板 */
.production-panel {
  height: 120px;
}

.production-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  height: 100%;
}

.production-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.production-item:hover {
  background: rgba(79, 172, 254, 0.1);
  transform: translateY(-2px);
}

.production-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 12px;
  font-size: 20px;
  color: #ffffff;
}

.production-info {
  flex: 1;
}

.production-value {
  font-size: 24px;
  font-weight: 700;
  color: #4facfe;
  margin-bottom: 4px;
}

.production-label {
  font-size: 12px;
  color: #8b9bb4;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .panels-container {
    grid-template-columns: 250px 1fr 250px;
  }
}

@media (max-width: 992px) {
  .panels-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }
}
</style>
