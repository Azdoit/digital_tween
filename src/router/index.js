import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import Dashboard from '@/views/Dashboard.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
       {
        path: '/3d_generate',
        name: '3DModelGeneration',
        component: () => import('@/views/ThreeDGenerate.vue')
      },
      {
        path: '/qa',
        name: 'IntelligentQA',
        component: () => import('@/views/IntelligentQA.vue')
      },
      {
        path: '/monitor',
        name: 'VideoMonitor',
        component: () => import('@/views/VideoMonitor.vue')
      },
      {
        path: '/status',
        name: 'DeviceStatus',
        component: () => import('@/views/DeviceStatus.vue')
      },
      {
        path: '/audio',
        name: 'AudioMonitor',
        component: () => import('@/views/AudioMonitor.vue')
      },
      {
        path: '/baosteel',
        name: 'BaosteelProject',
        component: () => import('@/views/BaosteelProject.vue')
      },
      {
        path: '/videos',
        name: 'VideoPlayer',
        component: () => import('@/views/VideoPlayer.vue')
      },
      {
        path: '/platform-architecture',
        name: 'PlatformArchitecture',
        component: () => import('@/views/PlatformArchitecture.vue')
      },
      // 新增：赛力斯知识图谱路由
      {
        path: '/sailisi',
        name: 'SailisiKnowledgeGraph',
        component: () => import('@/views/SailisiKnowledgeGraph.vue')
      },
      // 新增：知识库路由
      {
        path: '/knowledge-base',
        name: 'KnowledgeBase',
        component: () => import('@/views/KnowledgeBase.vue')
      },
      // 新增：模型库路由
      {
        path: '/model-library',
        name: 'ModelLibrary',
        component: () => import('@/views/ModelLibrary.vue')
      },
      // 新增：数据湖路由
      {
        path: '/data-lake',
        name: 'DataLake',
        component: () => import('@/views/DataLake.vue')
      },
      // 新增：传祺项目路由
      {
        path: '/gac',
        name: 'GacProject',
        component: () => import('@/views/GacProject.vue')
      },
      // 新增：智慧城市路由
      {
        path: '/smart-city',
        name: 'SmartCity',
        component: () => import('@/views/SmartCity.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
