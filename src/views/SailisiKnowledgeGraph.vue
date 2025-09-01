<template>
  <div class="knowledge-graph-page">
    <div class="page-header">
      <h2>赛力斯知识图谱</h2>
      <p>展示工厂知识结构和关系网络</p>
    </div>

    <div class="page-content">
      <div class="content-main">
        <div class="graph-container">
          <svg id="graph-svg" width="100%" height="100%"></svg>
        </div>
      </div>

      <div class="content-sidebar">
        <div class="sidebar-section">
          <h3>节点统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ graphData.nodes.length }}</div>
              <div class="stat-label">总节点数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ graphData.links.length }}</div>
              <div class="stat-label">总连线数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ nodeTypes.length }}</div>
              <div class="stat-label">节点类型</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as d3 from 'd3'

// 默认示例数据
const defaultData = {
  nodes: [
    { id: '1', name: '车门链接总成', type: 'factory', group: 1 },
    { id: '2', name: '线束总成', type: 'production', group: 1 },
    { id: '3', name: 'ECU控制器', type: 'production', group: 1 },
    { id: '4', name: '前门密封条', type: 'monitor', group: 1 },
    { id: '5', name: '后顶盖外板组件', type: 'quality', group: 1 },
    { id: '6', name: '短路', type: 'data', group: 2 },
    { id: '7', name: '材料', type: 'ai', group: 3 },
    { id: '8', name: '预测维护', type: 'maintenance', group: 4 },
    { id: '9', name: '能源管理', type: 'energy', group: 4 },
    { id: '10', name: '人员管理', type: 'personnel', group: 5 }
  ],
  links: [
    { source: '1', target: '2', type: 'contains', weight: 1 },
    { source: '1', target: '3', type: 'contains', weight: 1 },
    { source: '2', target: '4', type: 'monitors', weight: 2 },
    { source: '3', target: '4', type: 'monitors', weight: 2 },
    { source: '4', target: '5', type: 'feeds', weight: 1 },
    { source: '4', target: '6', type: 'generates', weight: 3 },
    { source: '6', target: '7', type: 'analyzes', weight: 2 },
    { source: '7', target: '8', type: 'enables', weight: 2 },
    { source: '7', target: '9', type: 'optimizes', weight: 2 },
    { source: '1', target: '10', type: 'manages', weight: 1 }
  ]
}

const graphData = ref(defaultData)

// 计算节点类型数量
const nodeTypes = computed(() => {
  const types = new Set(graphData.value.nodes.map(node => node.type))
  return Array.from(types)
})

// 节点类型颜色映射
const nodeColors = {
  factory: '#ff6b6b',
  production: '#4ecdc4',
  monitor: '#45b7d1',
  quality: '#96ceb4',
  data: '#feca57',
  ai: '#ff9ff3',
  maintenance: '#54a0ff',
  energy: '#5f27cd',
  personnel: '#00d2d3'
}

onMounted(() => {
  renderGraph()
})

const renderGraph = () => {
  const svg = d3.select('#graph-svg')
  const width = svg.node().getBoundingClientRect().width
  const height = svg.node().getBoundingClientRect().height
  
  // 清空SVG
  svg.selectAll('*').remove()
  
  // 创建力导向图
  const simulation = d3.forceSimulation(graphData.value.nodes)
    .force('link', d3.forceLink(graphData.value.links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30))
  
  // 创建连线
  const links = svg.append('g')
    .selectAll('line')
    .data(graphData.value.links)
    .enter()
    .append('line')
    .attr('stroke', '#999')
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.6)
  
  // 创建节点
  const nodes = svg.append('g')
    .selectAll('g')
    .data(graphData.value.nodes)
    .enter()
    .append('g')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
  
  // 添加节点圆圈
  nodes.append('circle')
    .attr('r', 20)
    .attr('fill', d => nodeColors[d.type] || '#ccc')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
  
  // 添加节点标签
  nodes.append('text')
    .text(d => d.name)
    .attr('text-anchor', 'middle')
    .attr('dy', '1.5em')
    .attr('font-size', '12px')
    .attr('fill', '#000')
    .attr('font-weight', 'bold')
  
  // 更新位置
  simulation.on('tick', () => {
    links
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
    
    nodes
      .attr('transform', d => `translate(${d.x},${d.y})`)
  })
  
  // 拖拽事件
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }
  
  function dragged(event, d) {
    d.fx = event.x
    d.fy = event.y
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }
}
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

.graph-container {
  height: 100%;
  width: 100%;
}

#graph-svg {
  width: 100%;
  height: 100%;
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

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #165dff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
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
