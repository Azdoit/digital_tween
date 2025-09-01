<template>
  <div class="knowledge-graph-page">
    <div class="page-header">
      <h2><icon-bulb /> 知识图谱展示</h2>
      <p>可视化展示工厂知识结构和关系网络</p>
    </div>
    
    <div class="page-content">
      <div class="content-main">
        <KnowledgeGraph 
          :data="currentGraphData" 
          @nodeClick="handleNodeClick"
          @linkClick="handleLinkClick"
        />
      </div>
      
      <div class="content-sidebar">
        <div class="sidebar-section">
          <h3>图谱类型</h3>
          <a-radio-group v-model="selectedGraphType" direction="vertical">
            <a-radio value="factory">工厂结构图谱</a-radio>
            <a-radio value="process">工艺流程图谱</a-radio>
            <a-radio value="equipment">设备关系图谱</a-radio>
            <a-radio value="knowledge">知识关联图谱</a-radio>
          </a-radio-group>
        </div>
        
        <div class="sidebar-section">
          <h3>节点详情</h3>
          <div v-if="selectedNode" class="node-details">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="节点名称">{{ selectedNode.name }}</a-descriptions-item>
              <a-descriptions-item label="节点类型">{{ selectedNode.type }}</a-descriptions-item>
              <a-descriptions-item label="所属分组">{{ selectedNode.group }}</a-descriptions-item>
            </a-descriptions>
            <a-button 
              type="primary" 
              size="small" 
              style="margin-top: 12px;"
              @click="showNodeInfo"
            >
              查看详细信息
            </a-button>
          </div>
          <div v-else class="no-selection">
            <icon-info-circle />
            <p>点击图谱中的节点查看详情</p>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3>连线详情</h3>
          <div v-if="selectedLink" class="link-details">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="关系类型">{{ selectedLink.type }}</a-descriptions-item>
              <a-descriptions-item label="关系强度">{{ selectedLink.weight }}</a-descriptions-item>
              <a-descriptions-item label="源节点">{{ getNodeName(selectedLink.source) }}</a-descriptions-item>
              <a-descriptions-item label="目标节点">{{ getNodeName(selectedLink.target) }}</a-descriptions-item>
            </a-descriptions>
          </div>
          <div v-else class="no-selection">
            <icon-info-circle />
            <p>点击图谱中的连线查看详情</p>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3>图谱统计</h3>
          <a-statistic title="总节点数" :value="currentGraphData.nodes?.length || 0" />
          <a-statistic title="总连线数" :value="currentGraphData.links?.length || 0" />
          <a-statistic title="图谱密度" :value="graphDensity" :precision="3" />
        </div>
      </div>
    </div>
    
    <!-- 节点信息弹窗 -->
    <a-modal
      v-model:visible="nodeInfoVisible"
      :title="selectedNode?.name + ' - 详细信息'"
      width="600px"
      :footer="null"
    >
      <div v-if="selectedNode" class="node-info-content">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="节点ID" span="1">{{ selectedNode.id }}</a-descriptions-item>
          <a-descriptions-item label="节点名称" span="1">{{ selectedNode.name }}</a-descriptions-item>
          <a-descriptions-item label="节点类型" span="1">{{ selectedNode.type }}</a-descriptions-item>
          <a-descriptions-item label="所属分组" span="1">{{ selectedNode.group }}</a-descriptions-item>
        </a-descriptions>
        
        <div class="related-nodes" style="margin-top: 20px;">
          <h4>相关节点</h4>
          <a-list size="small">
            <a-list-item v-for="relatedNode in getRelatedNodes(selectedNode)" :key="relatedNode.id">
              <a-tag :color="getNodeColor(relatedNode.type)">
                {{ relatedNode.name }}
              </a-tag>
            </a-list-item>
          </a-list>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import KnowledgeGraph from '@/components/KnowledgeGraph.vue'
import { allGraphData, graphTypeConfig, nodeTypeColors, relationTypeConfig } from '@/data/knowledgeGraphData'

// 响应式数据
const selectedGraphType = ref('factory')
const selectedNode = ref(null)
const selectedLink = ref(null)
const nodeInfoVisible = ref(false)

// 使用导入的图谱数据
const graphDataMap = allGraphData

// 计算属性
const currentGraphData = computed(() => {
  return graphDataMap[selectedGraphType.value] || graphDataMap.factory
})

const graphDensity = computed(() => {
  const nodes = currentGraphData.value.nodes?.length || 0
  const links = currentGraphData.value.links?.length || 0
  if (nodes <= 1) return 0
  return (2 * links) / (nodes * (nodes - 1))
})

// 方法
const handleNodeClick = (node) => {
  selectedNode.value = node
  selectedLink.value = null
}

const handleLinkClick = (link) => {
  selectedLink.value = link
  selectedNode.value = null
}

const getNodeName = (nodeId) => {
  const node = currentGraphData.value.nodes.find(n => n.id === nodeId)
  return node ? node.name : nodeId
}

const getRelatedNodes = (node) => {
  if (!node) return []
  
  const relatedIds = new Set()
  currentGraphData.value.links.forEach(link => {
    if (link.source === node.id || link.source.id === node.id) {
      relatedIds.add(link.target)
    }
    if (link.target === node.id || link.target.id === node.id) {
      relatedIds.add(link.source)
    }
  })
  
  return currentGraphData.value.nodes.filter(n => 
    relatedIds.has(n.id) || relatedIds.has(n)
  )
}

const getNodeColor = (type) => {
  return nodeTypeColors[type] || 'default'
}

const showNodeInfo = () => {
  nodeInfoVisible.value = true
}

// 监听图谱类型变化
watch(selectedGraphType, () => {
  selectedNode.value = null
  selectedLink.value = null
})
</script>

<style scoped>
.knowledge-graph-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.page-header {
  padding: 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #1d2129;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-header p {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.page-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

.content-main {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content-sidebar {
  width: 300px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1d2129;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.node-details, .link-details {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.no-selection {
  text-align: center;
  color: #86909c;
  padding: 20px;
}

.no-selection .arco-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.no-selection p {
  margin: 0;
  font-size: 14px;
}

.node-info-content {
  padding: 16px 0;
}

.related-nodes h4 {
  margin: 0 0 12px 0;
  color: #1d2129;
}

.related-nodes .arco-list-item {
  padding: 8px 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-content {
    flex-direction: column;
  }
  
  .content-sidebar {
    width: 100%;
    order: -1;
  }
}
</style>
