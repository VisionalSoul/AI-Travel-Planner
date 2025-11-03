<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <header class="navbar" v-if="showNavbar">
      <div class="container navbar-container">
        <router-link to="/" class="logo">
          <h1>AI Travel Planner</h1>
        </router-link>
        
        <nav class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/trips" class="nav-link" v-if="isAuthenticated">我的行程</router-link>
          <router-link to="/planner" class="nav-link" v-if="isAuthenticated">规划行程</router-link>
          <router-link to="/settings" class="nav-link" v-if="isAuthenticated">设置</router-link>
        </nav>
        
        <div class="user-actions">
          <div v-if="isAuthenticated" class="user-info">
            <span>{{ user?.username || '用户' }}</span>
            <el-dropdown @command="handleUserCommand">
              <span class="el-dropdown-link">
                <el-icon class="user-icon"><User /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <router-link to="/login" class="login-button" v-else>
            登录
          </router-link>
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 AI Travel Planner. 智能旅行，从这里开始。</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './store'
import { User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'App',
  components: {
    User
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const showNavbar = ref(true)
    
    // 计算属性
    const isAuthenticated = computed(() => userStore.isAuthenticated)
    const user = computed(() => userStore.user)
    
    // 处理用户命令
    const handleUserCommand = (command) => {
      if (command === 'logout') {
        userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/')
      } else if (command === 'profile') {
        router.push('/settings')
      }
    }
    
    // 检查路由，决定是否显示导航栏
    const checkRouteForNavbar = () => {
      const hiddenRoutes = ['/login', '/register']
      showNavbar.value = !hiddenRoutes.includes(route.path)
    }
    
    onMounted(() => {
      checkRouteForNavbar()
      
      // 监听路由变化
      router.afterEach(() => {
        checkRouteForNavbar()
      })
      
      // 尝试获取用户信息
      if (userStore.token && !userStore.user) {
        // 这里可以添加获取用户信息的逻辑
      }
    })
    
    return {
      isAuthenticated,
      user,
      showNavbar,
      handleUserCommand
    }
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 导航栏样式 */
.navbar {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 1rem 0;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  text-decoration: none;
}

.logo h1 {
  font-size: 1.5rem;
  color: #667eea;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #667eea;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-icon {
  font-size: 1.2rem;
  color: #667eea;
  cursor: pointer;
}

.login-button {
  background-color: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #5a67d8;
}

/* 主内容区 */
.main-content {
  min-height: calc(100vh - 180px);
}

/* 页脚样式 */
.footer {
  background-color: #333;
  color: white;
  padding: 2rem 0;
  margin-top: 2rem;
}

.footer p {
  text-align: center;
  margin: 0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    justify-content: center;
    gap: 1rem;
  }
  
  .logo h1 {
    font-size: 1.2rem;
  }
}
</style>
