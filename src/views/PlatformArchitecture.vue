<template>
  <div class="platform-architecture">
    <div class="page-header">
      <h1 class="page-title">平台架构</h1>
    </div>
    
    <div class="architecture-content">
      <div class="image-container">
        <img 
          src="/jiagou.png" 
          alt="平台架构图" 
          class="architecture-image"
          @error="handleImageError"
        />
      </div>
      

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const handleImageError = (event) => {
  console.error('图片加载失败:', event.target.src)
  // 可以设置一个默认图片或者显示错误信息
  event.target.style.display = 'none'
  const container = event.target.parentElement
  const errorDiv = document.createElement('div')
  errorDiv.className = 'image-error'
  errorDiv.innerHTML = '<p>图片加载失败，请检查文件路径</p>'
  container.appendChild(errorDiv)
}
</script>

<style scoped>
.platform-architecture {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.page-description {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.architecture-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.architecture-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-error {
  text-align: center;
  color: #ff4d4f;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .platform-architecture {
    padding: 15px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .image-container {
    padding: 15px;
    min-height: 300px;
  }
}
</style>
