<template>
  <div class="home-container">
    <header class="hero-section">
      <div class="hero-content">
        <h1>AI 旅行规划师</h1>
        <p>让旅行变得简单，AI为您智能规划完美旅程</p>
        <div class="cta-buttons">
          <el-button type="primary" size="large" @click="goToPlanner" v-if="isAuthenticated">
            开始规划
          </el-button>
          <el-button type="primary" size="large" @click="goToLogin" v-else>
            登录 / 注册
          </el-button>
        </div>
      </div>
    </header>

    <section class="features-section">
      <div class="container">
        <h2>核心功能</h2>
        <div class="features-grid">
          <div class="feature-card">
        <el-icon class="feature-icon"><MapLocation /></el-icon>
        <h3>智能行程规划</h3>
        <p>通过语音或文字输入您的旅行需求，AI自动生成个性化的旅行路线</p>
      </div>
          <div class="feature-card">
            <el-icon class="feature-icon"><Wallet /></el-icon>
            <h3>费用预算管理</h3>
            <p>智能预算分析，轻松记录旅行开销，合理控制支出</p>
          </div>
          <div class="feature-card">
            <el-icon class="feature-icon"><User /></el-icon>
            <h3>用户管理系统</h3>
            <p>多设备同步，云端存储，随时查看和修改您的旅行计划</p>
          </div>
          <div class="feature-card">
            <el-icon class="feature-icon"><Microphone /></el-icon>
            <h3>语音交互</h3>
            <p>支持语音输入和输出，解放双手，更便捷的交互体验</p>
          </div>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <div class="container">
        <h2>如何使用</h2>
        <div class="demo-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>告诉AI您的需求</h3>
              <p>通过语音或文字描述您的旅行目的地、日期、预算等信息</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>AI生成行程</h3>
              <p>系统智能分析并生成详细的旅行计划，包括交通、住宿、景点等</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>调整与优化</h3>
              <p>根据您的反馈调整行程，添加或修改细节</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>享受旅程</h3>
              <p>随时查看行程，记录开销，获得实时旅行建议</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 AI Travel Planner. 智能旅行，从这里开始。</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { useUserStore } from '../store'
import { Wallet, User, Microphone, MapLocation } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { onMounted, computed } from 'vue'

export default {
  name: 'HomeView',
  components: {
    MapLocation,
    Wallet,
    User,
    Microphone
  },
  setup() {
    const userStore = useUserStore()
    const router = useRouter()

    const isAuthenticated = computed(() => userStore.isAuthenticated)

    const goToLogin = () => {
      router.push('/login')
    }

    const goToPlanner = () => {
      router.push('/planner')
    }

    onMounted(() => {
      // 检查用户是否已登录
      if (userStore.token) {
        // 可以在这里获取用户信息
      }
    })

    return {
      isAuthenticated,
      goToLogin,
      goToPlanner
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero-section {
  height: 80vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('https://picsum.photos/id/1018/1920/1080') no-repeat center center/cover;
  opacity: 0.3;
}

.hero-content {
  text-align: center;
  z-index: 1;
  max-width: 800px;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.features-section {
  padding: 4rem 0;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.features-section h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.demo-section {
  padding: 4rem 0;
  background-color: white;
}

.demo-section h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: #333;
}

.demo-steps {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 2rem;
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
}

.step-number {
  width: 50px;
  height: 50px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.step-content p {
  color: #666;
}

.footer {
  background-color: #333;
  color: white;
  padding: 2rem 0;
  text-align: center;
  margin-top: auto;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
  
  .step {
    flex-direction: column;
    text-align: center;
  }
}
</style>