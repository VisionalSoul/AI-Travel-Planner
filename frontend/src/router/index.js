import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录', requiresAuth: false },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore()
      if (userStore.isAuthenticated) {
        next({ name: 'Home' })
      } else {
        next()
      }
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { title: '注册', requiresAuth: false },
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore()
      if (userStore.isAuthenticated) {
        next({ name: 'Home' })
      } else {
        next()
      }
    }
  },
  {
    path: '/planner',
    name: 'Planner',
    component: () => import('../views/PlannerView.vue'),
    meta: { title: '行程规划', requiresAuth: true }
  },
  {
    path: '/trips',
    name: 'Trips',
    component: () => import('../views/TripsView.vue'),
    meta: { title: '我的行程', requiresAuth: true }
  },
  {
    path: '/trips/:id',
    name: 'TripDetail',
    component: () => import('../views/TripDetailView.vue'),
    meta: { title: '行程详情', requiresAuth: true },
    props: true
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { title: '设置', requiresAuth: true }
  },
  // 未找到页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/' // 重定向到首页
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - AI Travel Planner` : 'AI Travel Planner'
  
  // 检查是否需要登录
  const userStore = useUserStore()
  if (to.meta.requiresAuth !== false && !userStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router