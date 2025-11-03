<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <h2>欢迎回来</h2>
      <p class="subtitle">登录您的账户开始规划旅程</p>
      
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        class="login-form"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱地址"
            prefix-icon="el-icon-message"
            type="email"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            show-password
            type="password"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="form-actions">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="authStore.loading"
            @click="handleLogin"
            class="login-button"
            :disabled="authStore.loading"
          >
            登录
          </el-button>
        </el-form-item>
        
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>
        
        <div class="register-link">
          <span>还没有账户？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useUserStore } from '../store'
import { ElMessage } from 'element-plus'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const loginFormRef = ref(null)
    const rememberMe = ref(false)
    
    const loginForm = reactive({
      email: '',
      password: ''
    })
    
    const loginRules = {
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
      ]
    }
    
    const handleLogin = async () => {
      if (!loginFormRef.value) return
      
      try {
        await loginFormRef.value.validate()
        
        console.log('开始登录流程，邮箱:', loginForm.email)
        const success = await authStore.login(loginForm.email, loginForm.password)
        
        console.log('登录结果:', success)
        console.log('当前用户状态:', {
          authStore: authStore.isAuthenticated,
          authToken: authStore.token,
          userStore: useUserStore().isAuthenticated,
          userToken: useUserStore().token
        })
        
        if (success) {
          ElMessage.success('登录成功！')
          
          // 如果勾选了记住我
          if (rememberMe.value) {
            localStorage.setItem('rememberToken', authStore.token)
          }
          
          // 检查是否有重定向URL
          const redirect = new URLSearchParams(window.location.search).get('redirect')
          const targetRoute = redirect || '/planner'
          console.log('准备跳转到:', targetRoute)
          
          try {
            // 确保路由跳转
            await router.push(targetRoute)
            console.log('跳转完成')
          } catch (navError) {
            console.error('路由跳转失败:', navError)
            // 备用跳转方案
            setTimeout(() => {
              console.log('使用备用方案跳转到:', targetRoute)
              window.location.href = targetRoute
            }, 500)
          }
        }
      } catch (error) {
        console.error('登录错误:', error)
        ElMessage.error('登录失败，请稍后重试')
      }
    }
    
    return {
      loginForm,
      loginRules,
      loginFormRef,
      authStore,
      rememberMe,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-form-wrapper {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-form-wrapper h2 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.8rem;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.login-form {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
}

.register-link span {
  color: #666;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  margin-left: 0.5rem;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-form-wrapper {
    padding: 1.5rem;
  }
}
</style>