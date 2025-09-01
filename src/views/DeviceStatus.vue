<template>
  <div class="status-page">
    <div class="status-container">
      <div class="status-header">
        <h2><icon-dashboard /> 设备状态监控</h2>
        <div class="status-controls">
          <a-space>
            <a-button size="small">
              <template #icon><icon-refresh /></template>
              刷新
            </a-button>
            <a-button size="small">
              <template #icon><icon-download /></template>
              导出
            </a-button>
            <a-select v-model="statusFilter" size="small" style="width: 120px">
              <a-option value="all">全部状态</a-option>
              <a-option value="online">在线</a-option>
              <a-option value="offline">离线</a-option>
              <a-option value="warning">警告</a-option>
              <a-option value="maintenance">维护中</a-option>
            </a-select>
          </a-space>
        </div>
      </div>
      
      <!-- 状态概览 -->
      <div class="status-overview">
        <div class="overview-card online">
          <div class="overview-icon">
            <icon-check-circle />
          </div>
          <div class="overview-info">
            <div class="overview-value">{{ overview.online }}</div>
            <div class="overview-label">在线设备</div>
          </div>
        </div>
        <div class="overview-card offline">
          <div class="overview-icon">
            <icon-close-circle />
          </div>
          <div class="overview-info">
            <div class="overview-value">{{ overview.offline }}</div>
            <div class="overview-label">离线设备</div>
          </div>
        </div>
        <div class="overview-card warning">
          <div class="overview-icon">
            <icon-exclamation-circle />
          </div>
          <div class="overview-info">
            <div class="overview-value">{{ overview.warning }}</div>
            <div class="overview-label">警告设备</div>
          </div>
        </div>
        <div class="overview-card maintenance">
          <div class="overview-icon">
            <icon-tool />
          </div>
          <div class="overview-info">
            <div class="overview-value">{{ overview.maintenance }}</div>
            <div class="overview-label">维护中</div>
          </div>
        </div>
      </div>
      
      <div class="status-content">
        <div class="device-grid">
          <div 
            v-for="device in filteredDevices" 
            :key="device.id"
            class="device-card"
          >
            <div class="device-header">
              <div class="device-icon">
                <icon-settings />
              </div>
              <div class="device-info">
                <div class="device-name">{{ device.name }}</div>
                <div class="device-location">{{ device.location }}</div>
              </div>
              <a-tag :color="getStatusColor(device.status)" size="small">
                {{ getStatusText(device.status) }}
              </a-tag>
            </div>
            
            <div class="device-metrics">
              <div class="metric-item">
                <div class="metric-label">运行时间</div>
                <div class="metric-value">{{ device.uptime }}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">温度</div>
                <div class="metric-value" :class="getLoadColor(device.temperature)">
                  {{ device.temperature }}°C
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-label">负载</div>
                <div class="metric-value" :class="getLoadColor(device.load)">
                  {{ device.load }}%
                </div>
              </div>
            </div>
            
            <div class="device-health">
              <div class="health-label">健康度</div>
              <a-progress 
                :percent="device.health" 
                :color="getHealthColor(device.health)"
                size="small"
                :show-text="false"
              />
              <span class="health-value">{{ device.health }}%</span>
            </div>
            
            <div class="device-actions">
              <a-button size="small" type="text" @click="viewDetails(device.id)">
                <template #icon><icon-eye /></template>
                详情
              </a-button>
              <a-button 
                size="small" 
                type="text" 
                @click="togglePower(device.id)"
                :class="{ 'power-off': !device.powered }"
              >
                <template #icon>
                  <icon-poweroff v-if="device.powered" />
                  <icon-play-circle v-else />
                </template>
                {{ device.powered ? '关机' : '开机' }}
              </a-button>
              <a-button size="small" type="text" @click="scheduleMaintenance(device.id)">
                <template #icon><icon-tool /></template>
                维护
              </a-button>
            </div>
          </div>
        </div>
        
        <div class="status-sidebar">
          <div class="realtime-chart">
            <h3>实时监控</h3>
            <div class="chart-placeholder">
              <icon-bar-chart class="chart-icon" />
              <p>设备运行状态图表</p>
            </div>
          </div>
          
          <div class="device-alerts">
            <h3>设备告警</h3>
            <div class="alert-list">
              <div 
                v-for="alert in alerts" 
                :key="alert.id"
                class="alert-item"
                :class="alert.level"
              >
                <div class="alert-icon">
                  <icon-exclamation-circle v-if="alert.level === 'high'" />
                  <icon-info-circle v-else />
                </div>
                <div class="alert-content">
                  <div class="alert-title">{{ alert.title }}</div>
                  <div class="alert-device">{{ alert.device }}</div>
                  <div class="alert-time">{{ alert.time }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="maintenance-schedule">
            <h3>维护计划</h3>
            <div class="schedule-list">
              <div 
                v-for="schedule in maintenanceSchedule" 
                :key="schedule.id"
                class="schedule-item"
              >
                <div class="schedule-date">
                  <div class="date-day">{{ schedule.day }}</div>
                  <div class="date-month">{{ schedule.month }}</div>
                </div>
                <div class="schedule-info">
                  <div class="schedule-device">{{ schedule.device }}</div>
                  <div class="schedule-type">{{ schedule.type }}</div>
                </div>
                <a-tag :color="schedule.status === 'pending' ? 'orange' : 'green'" size="small">
                  {{ schedule.status === 'pending' ? '待执行' : '已完成' }}
                </a-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const statusFilter = ref('all')

const overview = ref({
  online: 15,
  offline: 2,
  warning: 3,
  maintenance: 1
})

const devices = ref([
  { id: 1, name: '生产线A-01', location: '车间A', status: 'online', uptime: '24h 30m', temperature: 45, load: 78, health: 92, powered: true },
  { id: 2, name: '生产线A-02', location: '车间A', status: 'online', uptime: '18h 15m', temperature: 52, load: 85, health: 87, powered: true },
  { id: 3, name: '生产线B-01', location: '车间B', status: 'warning', uptime: '12h 45m', temperature: 68, load: 95, health: 73, powered: true },
  { id: 4, name: '生产线B-02', location: '车间B', status: 'offline', uptime: '0h 0m', temperature: 25, load: 0, health: 45, powered: false },
  { id: 5, name: '包装机-01', location: '包装区', status: 'online', uptime: '8h 20m', temperature: 38, load: 62, health: 95, powered: true },
  { id: 6, name: '包装机-02', location: '包装区', status: 'maintenance', uptime: '0h 0m', temperature: 22, load: 0, health: 88, powered: false },
  { id: 7, name: '质检设备-01', location: '质检区', status: 'online', uptime: '16h 10m', temperature: 42, load: 71, health: 89, powered: true },
  { id: 8, name: '质检设备-02', location: '质检区', status: 'online', uptime: '14h 35m', temperature: 39, load: 65, health: 91, powered: true },
  { id: 9, name: '输送带-01', location: '物流区', status: 'warning', uptime: '22h 5m', temperature: 48, load: 88, health: 76, powered: true },
  { id: 10, name: '输送带-02', location: '物流区', status: 'online', uptime: '20h 50m', temperature: 44, load: 72, health: 94, powered: true }
])

const alerts = ref([
  { id: 1, level: 'high', title: '温度过高', device: '生产线B-01', time: '2分钟前' },
  { id: 2, level: 'medium', title: '负载过高', device: '输送带-01', time: '5分钟前' },
  { id: 3, level: 'low', title: '设备离线', device: '生产线B-02', time: '10分钟前' },
  { id: 4, level: 'medium', title: '健康度下降', device: '生产线A-02', time: '15分钟前' }
])

const maintenanceSchedule = ref([
  { id: 1, day: '15', month: '12月', device: '生产线A-01', type: '定期保养', status: 'pending' },
  { id: 2, day: '16', month: '12月', device: '包装机-01', type: '零件更换', status: 'pending' },
  { id: 3, day: '14', month: '12月', device: '质检设备-02', type: '校准检查', status: 'completed' },
  { id: 4, day: '17', month: '12月', device: '输送带-01', type: '预防维护', status: 'pending' }
])

const filteredDevices = computed(() => {
  if (statusFilter.value === 'all') {
    return devices.value
  }
  return devices.value.filter(device => device.status === statusFilter.value)
})

const getStatusColor = (status) => {
  const colors = {
    online: 'green',
    offline: 'red',
    warning: 'orange',
    maintenance: 'blue'
  }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    online: '在线',
    offline: '离线',
    warning: '警告',
    maintenance: '维护中'
  }
  return texts[status] || '未知'
}

const getLoadColor = (value) => {
  if (value >= 90) return 'text-danger'
  if (value >= 70) return 'text-warning'
  return 'text-success'
}

const getHealthColor = (health) => {
  if (health >= 90) return '#52c41a'
  if (health >= 70) return '#faad14'
  return '#f5222d'
}

const viewDetails = (deviceId) => {
  console.log(`查看设备详情: ${deviceId}`)
}

const togglePower = (deviceId) => {
  const device = devices.value.find(d => d.id === deviceId)
  if (device) {
    device.powered = !device.powered
    device.status = device.powered ? 'online' : 'offline'
  }
}

const scheduleMaintenance = (deviceId) => {
  console.log(`安排维护: ${deviceId}`)
}
</script>

<style scoped>
.status-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.status-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.overview-card.online {
  border-left: 4px solid #52c41a;
}

.overview-card.offline {
  border-left: 4px solid #f5222d;
}

.overview-card.warning {
  border-left: 4px solid #faad14;
}

.overview-card.maintenance {
  border-left: 4px solid #1890ff;
}

.overview-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
  color: #ffffff;
}

.overview-card.online .overview-icon {
  background: linear-gradient(45deg, #52c41a, #73d13d);
}

.overview-card.offline .overview-icon {
  background: linear-gradient(45deg, #f5222d, #ff4d4f);
}

.overview-card.warning .overview-icon {
  background: linear-gradient(45deg, #faad14, #ffc53d);
}

.overview-card.maintenance .overview-icon {
  background: linear-gradient(45deg, #1890ff, #40a9ff);
}

.overview-info {
  flex: 1;
}

.overview-value {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.overview-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.status-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  height: calc(100vh - 300px);
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  overflow-y: auto;
}

.device-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  transition: all 0.3s ease;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.device-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.device-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #1890ff, #52c41a);
  border-radius: 8px;
  font-size: 18px;
  color: #ffffff;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
}

.device-location {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.device-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.metric-item {
  text-align: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.metric-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.text-success {
  color: #52c41a !important;
}

.text-warning {
  color: #faad14 !important;
}

.text-danger {
  color: #f5222d !important;
}

.device-health {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.health-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  min-width: 60px;
}

.health-value {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  min-width: 40px;
}

.device-actions {
  display: flex;
  gap: 8px;
}

.power-off {
  color: #f5222d !important;
}

.status-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.realtime-chart,
.device-alerts,
.maintenance-schedule {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.realtime-chart h3,
.device-alerts h3,
.maintenance-schedule h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  background: linear-gradient(135deg, #1a2332 0%, #0c1426 100%);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
}

.chart-icon {
  font-size: 32px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.5);
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.alert-item.high {
  background: rgba(245, 34, 45, 0.2);
  border-left: 4px solid #f5222d;
}

.alert-item.medium {
  background: rgba(250, 173, 20, 0.2);
  border-left: 4px solid #faad14;
}

.alert-item.low {
  background: rgba(82, 196, 26, 0.2);
  border-left: 4px solid #52c41a;
}

.alert-icon {
  font-size: 16px;
  color: #ffffff;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 2px;
}

.alert-device {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2px;
}

.alert-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.schedule-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.schedule-date {
  text-align: center;
  min-width: 50px;
}

.date-day {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.date-month {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.schedule-info {
  flex: 1;
}

.schedule-device {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 2px;
}

.schedule-type {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .status-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .device-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 992px) {
  .status-content {
    grid-template-columns: 1fr;
  }
  
  .status-sidebar {
    order: -1;
  }
  
  .status-overview {
    grid-template-columns: 1fr;
  }
}
</style>
