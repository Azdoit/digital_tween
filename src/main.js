import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import App from './App.vue'
import router from './router'
import './style.css'

// 导入模型预加载器
import { initModelPreloader } from './composables/useModelPreloader'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ArcoVue)

app.mount('#app')

// 在应用挂载后初始化模型预加载
console.log('应用已挂载，开始初始化3D模型预加载...')

// 启动模型预加载
initModelPreloader().then(() => {
  console.log('模型预加载器已初始化')
}).catch(error => {
  console.error('模型预加载器初始化失败:', error)
})
