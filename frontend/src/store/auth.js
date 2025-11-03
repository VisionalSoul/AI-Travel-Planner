import { defineStore } from 'pinia'
import { authService } from '../services/apiService'
import { useUserStore } from './index'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user
  },

  actions: {
    // 用户登录
    async login(email, password) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authService.login({ email, password })
        
        if (response.success) {
          this.user = response.user
          this.isAuthenticated = true
          // 保存到localStorage
          localStorage.setItem('user', JSON.stringify(response.user))
          localStorage.setItem('token', response.token)
          
          // 同时更新userStore的状态，确保App.vue和路由守卫能正确识别登录状态
          const userStore = useUserStore()
          userStore.setUser(response.user)
          userStore.setToken(response.token)
          
          return true
        } else {
          throw new Error(response.message || '登录失败')
        }
      } catch (error) {
        this.error = error.message || '登录失败，请重试'
        return false
      } finally {
        this.loading = false
      }
    },

    // 用户注册
    async register(username, email, password) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authService.register({ username, email, password })
        
        if (response.success) {
          this.user = response.user
          this.isAuthenticated = true
          // 保存到localStorage
          localStorage.setItem('user', JSON.stringify(response.user))
          localStorage.setItem('token', response.token)
          
          // 同时更新userStore的状态，确保App.vue和路由守卫能正确识别登录状态
          const userStore = useUserStore()
          userStore.setUser(response.user)
          userStore.setToken(response.token)
          
          return true
        } else {
          throw new Error(response.message || '注册失败')
        }
      } catch (error) {
        this.error = error.message || '注册失败，请重试'
        return false
      } finally {
        this.loading = false
      }
    },

    // 登出
    logout() {
      this.isAuthenticated = false
      this.user = null
      this.error = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      
      // 同时调用userStore的logout方法
      const userStore = useUserStore()
      userStore.logout()
    },

    // 初始化时检查用户登录状态
    checkAuth() {
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (user && token) {
        this.user = JSON.parse(user)
        this.isAuthenticated = true
        
        // 同时更新userStore的状态
        const userStore = useUserStore()
        userStore.setUser(this.user)
        userStore.setToken(token)
        
        // 验证token有效性
        this.verifyToken()
      }
    },

    // 验证token有效性
    async verifyToken() {
      try {
        const response = await authService.getCurrentUser()
        if (response.success) {
          this.user = response.user
        } else {
          // token无效，清除登录状态
          this.logout()
        }
      } catch (error) {
        // 发生错误，清除登录状态
        this.logout()
      }
    }
  }
})