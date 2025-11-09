<template>
  <div class="settings-container">
    <h2 class="page-title">设置</h2>
    
    <el-tabs v-model="activeTab">
      <!-- 语音设置 -->
      <el-tab-pane label="语音设置" name="speech">
        <div class="settings-card">
          <h3 class="card-title">语音识别设置</h3>
          
          <div class="settings-group">
            <el-form ref="speechForm" :model="speechSettings" label-width="150px" class="settings-form">
              <el-form-item label="语音识别服务">
                <el-radio-group v-model="speechSettings.provider">
                  <el-radio label="browser">浏览器自带语音识别</el-radio>
                  <el-radio label="xfyun">科大讯飞语音识别</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item 
                label="科大讯飞 AppID" 
                v-if="speechSettings.provider === 'xfyun'"
                prop="appId"
                :rules="[{ required: true, message: '请输入AppID', trigger: 'blur' }]"
              >
                <el-input 
                  v-model="speechSettings.appId" 
                  placeholder="请输入科大讯飞AppID"
                  show-password
                />
              </el-form-item>
              
              <el-form-item 
                label="科大讯飞 API Key" 
                v-if="speechSettings.provider === 'xfyun'"
                prop="apiKey"
                :rules="[{ required: true, message: '请输入API Key', trigger: 'blur' }]"
              >
                <el-input 
                  v-model="speechSettings.apiKey" 
                  placeholder="请输入科大讯飞API Key"
                  show-password
                />
              </el-form-item>
              
              <el-form-item 
                label="科大讯飞 Secret Key" 
                v-if="speechSettings.provider === 'xfyun'"
                prop="secretKey"
                :rules="[{ required: true, message: '请输入Secret Key', trigger: 'blur' }]"
              >
                <el-input 
                  v-model="speechSettings.secretKey" 
                  placeholder="请输入科大讯飞Secret Key"
                  show-password
                />
              </el-form-item>
              
              <el-form-item label="识别语言">
                <el-select v-model="speechSettings.language" placeholder="选择识别语言">
                  <el-option label="中文(普通话)" value="zh-CN" />
                  <el-option label="英语(美国)" value="en-US" />
                  <el-option label="日语" value="ja-JP" />
                  <el-option label="韩语" value="ko-KR" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="语音合成语速">
                <el-slider
                  v-model="speechSettings.speechRate"
                  :min="0.5"
                  :max="2"
                  :step="0.1"
                  :format-tooltip="value => value.toFixed(1)"
                />
                <div class="slider-value">{{ speechSettings.speechRate }}</div>
              </el-form-item>
              
              <el-form-item label="语音合成音量">
                <el-slider
                  v-model="speechSettings.volume"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  :format-tooltip="value => value.toFixed(1)"
                />
                <div class="slider-value">{{ speechSettings.volume }}</div>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveSpeechSettings" :loading="isSaving">
                  保存设置
                </el-button>
                <el-button @click="testSpeechRecognition" v-if="isBrowserSupported">
                  测试语音识别
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- 个人信息设置 -->
      <el-tab-pane label="个人信息" name="profile">
        <div class="settings-card">
          <h3 class="card-title">个人资料</h3>
          
          <div class="settings-group">
            <el-form :model="userProfile" label-width="120px">
              <el-form-item label="用户名">
                <el-input v-model="userProfile.username" disabled />
              </el-form-item>
              
              <el-form-item label="邮箱">
                <el-input v-model="userProfile.email" disabled />
              </el-form-item>
              
              <el-form-item label="旅行偏好">
                <el-select
                  v-model="userProfile.preferences"
                  multiple
                  placeholder="请选择您的旅行偏好"
                >
                  <el-option label="美食" value="food" />
                  <el-option label="购物" value="shopping" />
                  <el-option label="文化景点" value="culture" />
                  <el-option label="自然风光" value="nature" />
                  <el-option label="历史古迹" value="history" />
                  <el-option label="户外探险" value="adventure" />
                  <el-option label="亲子活动" value="family" />
                  <el-option label="艺术展览" value="art" />
                </el-select>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveProfile">
                  保存个人信息
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- AI 设置 -->
      <el-tab-pane label="AI 设置" name="ai">
        <div class="settings-card">
          <h3 class="card-title">AI 行程规划设置</h3>
          
          <div class="settings-group">
            <el-form ref="aiForm" :model="aiSettings" label-width="150px">
              <el-form-item 
                label="AI 服务提供商"
              >
                <el-radio-group v-model="aiSettings.provider">
                  <el-radio label="aliyun-bailian">阿里云百炼</el-radio>
                  <el-radio label="openai">OpenAI</el-radio>
                  <el-radio label="anthropic">Anthropic</el-radio>
                  <el-radio label="azure">Azure OpenAI</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <!-- 阿里云百炼配置 -->
              <el-form-item 
                v-if="aiSettings.provider === 'aliyun-bailian'"
                label="API Key" 
                prop="apiKey"
                :rules="[{ required: true, message: '请输入API Key', trigger: 'blur' }]"
              >
                <el-input 
                  v-model="aiSettings.apiKey" 
                  placeholder="请输入阿里云百炼API Key"
                  show-password
                />
              </el-form-item>
              
              <!-- 其他提供商的API Key -->
              <el-form-item 
                v-else
                label="API Key" 
                prop="apiKey"
                :rules="[{ required: true, message: '请输入API Key', trigger: 'blur' }]"
              >
                <el-input 
                  v-model="aiSettings.apiKey" 
                  placeholder="请输入API Key"
                  show-password
                />
              </el-form-item>
              
              <el-form-item 
                label="模型"
                prop="model"
              >
                <el-select 
                  v-model="aiSettings.model" 
                  placeholder="选择模型"
                  filterable
                >
                  <el-option 
                    v-for="model in availableModels" 
                    :key="model.value" 
                    :label="model.label" 
                    :value="model.value" 
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveAISettings">
                  保存设置
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 语音测试对话框 -->
    <el-dialog
      v-model="testDialogVisible"
      title="测试语音识别"
      width="500px"
      center
    >
      <div class="test-dialog-content">
        <div class="test-instructions">
          请点击下方按钮，然后说出您的旅行需求（例如："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"）
        </div>
        
        <div class="test-result" v-if="testResult">
          <strong>识别结果：</strong>
          <p>{{ testResult }}</p>
        </div>
        
        <div class="test-status" :class="{ 'listening': isListening }">
          {{ isListening ? '正在聆听...' : '准备就绪' }}
        </div>
      </div>
      
      <template #footer>
        <el-button @click="testDialogVisible = false">关闭</el-button>
        <el-button 
          type="primary" 
          @click="toggleSpeechTest"
          :loading="isListening"
        >
          {{ isListening ? '停止' : '开始测试' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store'
import SpeechService from '../services/speechService'
import { userAPI } from '../services/api'

export default {
  name: 'SettingsView',
  setup() {
    // 用户状态
    const userStore = useUserStore()
    
    // 表单和状态
    const activeTab = ref('speech')
    const isSaving = ref(false)
    const testDialogVisible = ref(false)
    const isListening = ref(false)
    const testResult = ref('')
    
    // 语音服务实例
    let speechService = null
    
    // 语音设置
    const speechSettings = reactive({
      provider: 'browser', // 浏览器自带或科大讯飞
      appId: '', // 科大讯飞 AppID
      apiKey: '', // 科大讯飞 API Key
      secretKey: '', // 科大讯飞 Secret Key
      language: 'zh-CN', // 识别语言
      speechRate: 1.0, // 语音合成语速
      volume: 0.8 // 语音合成音量
    })
    
    // 用户个人资料
    const userProfile = reactive({
      username: userStore.user?.username || '',
      email: userStore.user?.email || '',
      preferences: [] // 旅行偏好
    })
    
    // AI设置
    const aiSettings = reactive({
      provider: 'aliyun-bailian', // AI服务提供商
      apiKey: '', // API Key
      model: 'qwen-plus' // 默认模型
    })
    
    // 可用模型（根据提供商动态变化）
    const availableModels = computed(() => {
      switch (aiSettings.provider) {
        case 'aliyun-bailian':
          return [
            { label: '通义千问 VL 32B Thinking', value: 'qwen3-vl-32b-thinking' },
            { label: '通义千问 Plus', value: 'qwen-plus' },
            { label: '通义千问 Turbo', value: 'qwen-turbo' },
            { label: '通义千问 Max', value: 'qwen-max' }
          ]
        case 'openai':
          return [
            { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
            { label: 'GPT-4', value: 'gpt-4' },
            { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' }
          ]
        case 'anthropic':
          return [
            { label: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
            { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
            { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' }
          ]
        case 'azure':
          return [
            { label: 'Azure GPT-3.5 Turbo', value: 'azure-gpt-35-turbo' },
            { label: 'Azure GPT-4', value: 'azure-gpt-4' }
          ]
        default:
          return []
      }
    })
    
    // 检查浏览器是否支持语音识别
    const isBrowserSupported = computed(() => {
      return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    })
    
    // 从本地存储加载设置
    const loadSettings = () => {
      // 加载语音设置
      const savedSpeechSettings = localStorage.getItem('speechSettings')
      if (savedSpeechSettings) {
        Object.assign(speechSettings, JSON.parse(savedSpeechSettings))
      }
      
      // 加载AI设置
      aiSettings.provider = localStorage.getItem('ai_provider') || 'aliyun-bailian'
      
      // 加载对应的凭证 - 统一从ai_api_key读取API密钥
      aiSettings.apiKey = localStorage.getItem('ai_api_key') || ''
      
      aiSettings.model = localStorage.getItem('ai_model') || 'qwen-plus'
      
      // 加载用户偏好
      const savedPreferences = localStorage.getItem('userPreferences')
      if (savedPreferences) {
        userProfile.preferences = JSON.parse(savedPreferences)
      }
    }
    
    // 保存语音设置
    const saveSpeechSettings = async () => {
      isSaving.value = true
      try {
        // 保存到本地存储
        localStorage.setItem('speechSettings', JSON.stringify(speechSettings))
        
        ElMessage.success('语音设置保存成功')
      } catch (error) {
        console.error('保存语音设置失败:', error)
        ElMessage.error('保存语音设置失败，请重试')
      } finally {
        isSaving.value = false
      }
    }
    
    // 保存用户个人资料
    const saveProfile = async () => {
      try {
        // 保存到本地存储（实际应用中应调用API保存到服务器）
        localStorage.setItem('userPreferences', JSON.stringify(userProfile.preferences))
        
        // 更新用户store
        userStore.updateUser({ preferences: userProfile.preferences })
        
        ElMessage.success('个人信息保存成功')
      } catch (error) {
        console.error('保存个人信息失败:', error)
        ElMessage.error('保存个人信息失败，请重试')
      }
    }
    
    // 保存AI设置
    const saveAISettings = async () => {
      try {
        console.log('保存AI设置前检查:', {
          provider: aiSettings.provider,
          apiKey_set: !!aiSettings.apiKey,
          apiKey_preview: aiSettings.apiKey ? aiSettings.apiKey.substring(0, 5) + '...' : ''
        })
        
        // 保存到本地存储，使用与settings store一致的键名
        localStorage.setItem('ai_provider', aiSettings.provider)
        
        // 保存API密钥
        localStorage.setItem('ai_api_key', aiSettings.apiKey)
        
        localStorage.setItem('ai_model', aiSettings.model)
        
        // 验证保存结果
        const savedKey = localStorage.getItem('ai_api_key')
        console.log('AI设置保存后验证:', {
          saved_provider: localStorage.getItem('ai_provider'),
          saved_apiKey_exists: !!savedKey,
          saved_apiKey_preview: savedKey ? savedKey.substring(0, 5) + '...' : ''
        })
        
        ElMessage.success('AI设置保存成功')
      } catch (error) {
        console.error('保存AI设置失败:', error)
        ElMessage.error('保存AI设置失败，请重试')
      }
    }
    
    // 测试语音识别
    const testSpeechRecognition = () => {
      if (!isBrowserSupported.value && speechSettings.provider === 'browser') {
        ElMessage.warning('您的浏览器不支持语音识别功能，请尝试使用其他浏览器或选择科大讯飞服务')
        return
      }
      
      testDialogVisible.value = true
      testResult.value = ''
    }
    
    // 切换语音测试
    const toggleSpeechTest = async () => {
      if (isListening.value) {
        // 停止识别
        if (speechService) {
          await speechService.stopListening()
        }
        isListening.value = false
      } else {
        // 开始识别
        if (!speechService) {
          speechService = new SpeechService(speechSettings)
        } else {
          speechService.updateSettings(speechSettings)
        }
        
        isListening.value = true
        testResult.value = ''
        
        try {
          const result = await speechService.startListening({
            onResult: (transcript) => {
              testResult.value = transcript
            },
            onError: (error) => {
              console.error('语音识别错误:', error)
              ElMessage.error('语音识别失败，请重试')
              isListening.value = false
            },
            onEnd: () => {
              isListening.value = false
            }
          })
        } catch (error) {
          console.error('语音识别错误:', error)
          ElMessage.error('无法启动语音识别，请检查设置')
          isListening.value = false
        }
      }
    }
    
    // 初始化
    onMounted(() => {
      loadSettings()
      
      // 如果用户未登录，重定向到登录页
      if (!userStore.isAuthenticated) {
        router.push('/login')
      }
    })
    
    return {
      activeTab,
      isSaving,
      speechSettings,
      userProfile,
      aiSettings,
      availableModels,
      isBrowserSupported,
      testDialogVisible,
      isListening,
      testResult,
      saveSpeechSettings,
      saveProfile,
      saveAISettings,
      testSpeechRecognition,
      toggleSpeechTest
    }
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.page-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

.settings-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.card-title {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #ebeef5;
}

.settings-group {
  margin-bottom: 1rem;
}

.settings-form {
  max-width: 100%;
}

.slider-value {
  text-align: center;
  margin-top: 0.5rem;
  color: #606266;
}

.test-dialog-content {
  padding: 1rem 0;
}

.test-instructions {
  font-size: 0.95rem;
  color: #606266;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.test-result {
  background-color: #f5f7fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  word-break: break-word;
}

.test-status {
  text-align: center;
  padding: 0.8rem;
  border-radius: 4px;
  background-color: #ecf5ff;
  color: #409eff;
  transition: all 0.3s;
}

.test-status.listening {
  background-color: #fef0f0;
  color: #f56c6c;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-container {
    margin: 1rem auto;
  }
  
  .page-title {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }
  
  .settings-card {
    padding: 1rem;
  }
  
  .card-title {
    font-size: 1.2rem;
  }
}
</style>