<template>
  <div class="model-library-page">
    <div class="page-header">
      <h2>模型库</h2>
      <p>管理和部署AI模型、数字孪生模型和业务模型</p>
    </div>

    <div class="content-container">
      <!-- 模型分类展示 -->
      <div class="model-categories">
        <h2>模型分类</h2>
        <div class="categories-grid">
          <div v-for="category in modelCategories" :key="category.id" class="category-card">
            <div class="category-image">
              <img :src="category.image" :alt="category.name" />
              <div class="category-overlay">
                <span class="category-count">{{ category.count }} 个模型</span>
              </div>
            </div>
            <div class="category-content">
              <h3>{{ category.name }}</h3>
              <p>{{ category.description }}</p>
              <div class="category-tags">
                <span v-for="tag in category.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 模型分类数据
const modelCategories = ref([
  {
    id: 1,
    name: '未来工厂及智能制造',
    count: 200,
    description: '涵盖智能生产线、工业4.0、数字孪生工厂等先进制造技术模型',
    image: '/images/机械臂.jpg',
    tags: ['智能制造', '工业4.0', '数字孪生', '自动化']
  },
  {
    id: 2,
    name: '智能城市及智慧交通',
    count: 500,
    description: '包含城市管理、交通优化、环境监测等智慧城市解决方案模型',
    image: '/images/公共汽车.webp',
    tags: ['智慧城市', '交通优化', '环境监测', '城市管理']
  },
  {
    id: 3,
    name: '智慧港口及智能航运',
    count: 300,
    description: '涵盖港口自动化、船舶调度、物流优化等航运智能化模型',
    image: '/images/港口.webp',
    tags: ['智慧港口', '智能航运', '物流优化', '自动化']
  },
  {
    id: 4,
    name: '社会民生及智慧家居',
    count: 300,
    description: '包含智能家居、健康医疗、教育服务等民生领域智能化模型',
    image: '/images/扫地机器人.jpg',
    tags: ['智慧家居', '健康医疗', '教育服务', '民生服务']
  },
  {
    id: 5,
    name: '其它模型',
    count: 1000,
    description: '涵盖金融科技、农业科技、能源管理等其他领域的智能化模型',
    image: '/images/无人机.webp',
    tags: ['金融科技', '农业科技', '能源管理', '其他领域']
  }
])
</script>

<style scoped>
.model-library-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
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

.content-container {
  background: white;
  border-radius: 8px;
  padding: 24px;
}



.model-categories {
  margin-bottom: 32px;
}

.model-categories h2 {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.category-card {
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.category-image {
  position: relative;
  height: 50vh;
  min-height: 300px;
  max-height: 500px;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #f0f0f0;
}

.category-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.category-count {
  font-size: 14px;
  font-weight: 600;
}

.category-content {
  padding: 16px;
}

.category-content h3 {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.category-content p {
  margin-bottom: 12px;
  font-size: 14px;
  color: #4e5969;
  line-height: 1.4;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #e6f7ff;
  color: #1890ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .category-image {
    height: 40vh;
    min-height: 220px;
    max-height: 300px;
  }
}
</style>
