<template>
  <div class="planner-container">
    <div class="container">
      <h1>AI 行程规划</h1>
      <p class="subtitle">告诉我们您的旅行需求，AI将为您生成完美的行程计划</p>
      
      <div class="planner-content">
        <div class="input-section">
          <div class="speech-input-container">
            <div class="speech-input-box">
              <el-input
                v-model="tripRequirements"
                type="textarea"
                :rows="6"
                placeholder="请输入您的旅行需求，例如：'我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子'"
                class="trip-input"
              />
              
              <div class="speech-controls">
                <el-button
                  type="primary"
                  icon="el-icon-microphone"
                  :loading="isListening"
                  @click="toggleVoiceRecognition"
                  class="voice-btn"
                  :disabled="isLoading"
                >
                  {{ isListening ? '停止录音' : '语音输入' }}
                </el-button>
                
                <el-button
                  @click="parseRequirements"
                  icon="el-icon-search"
                  :disabled="isLoading"
                >
                  解析需求
                </el-button>
              </div>
            </div>
          </div>
          
          <el-collapse v-model="activeNames">
            <el-collapse-item title="高级选项" name="1">
              <div class="advanced-options">
                <el-form :model="form" label-width="120px" class="advanced-form">
                  <el-form-item label="目的地" prop="destination">
                    <el-input v-model="form.destination" placeholder="请输入目的地" />
                  </el-form-item>
                  
                  <div class="date-range">
                    <el-form-item label="开始日期" prop="startDate">
                      <el-date-picker
                        v-model="form.startDate"
                        type="date"
                        placeholder="选择开始日期"
                        style="width: 100%;"
                        :disabled="isLoading"
                      />
                    </el-form-item>
                    
                    <el-form-item label="结束日期" prop="endDate">
                      <el-date-picker
                        v-model="form.endDate"
                        type="date"
                        placeholder="选择结束日期"
                        style="width: 100%;"
                        :disabled="isLoading"
                      />
                    </el-form-item>
                  </div>
                  
                  <el-form-item label="预算（元）" prop="budget">
                    <el-input-number
                      v-model="form.budget"
                      :min="1000"
                      :step="1000"
                      placeholder="请输入预算"
                      :disabled="isLoading"
                    />
                  </el-form-item>
                  
                  <el-form-item label="同行人数" prop="travelers">
                    <el-input-number
                      v-model="form.travelers"
                      :min="1"
                      :max="20"
                      placeholder="请输入人数"
                      :disabled="isLoading"
                    />
                  </el-form-item>
                  
                  <el-form-item label="旅行偏好">
                    <el-checkbox-group v-model="form.preferences">
                      <el-checkbox label="美食" />
                      <el-checkbox label="购物" />
                      <el-checkbox label="历史文化" />
                      <el-checkbox label="自然风光" />
                      <el-checkbox label="休闲度假" />
                      <el-checkbox label="冒险活动" />
                      <el-checkbox label="亲子活动" />
                      <el-checkbox label="艺术展览" />
                    </el-checkbox-group>
                  </el-form-item>
                  
                  <el-form-item label="备注" prop="notes">
                    <el-input
                      v-model="form.notes"
                      type="textarea"
                      :rows="3"
                      placeholder="其他特殊需求或偏好"
                      :disabled="isLoading"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </el-collapse-item>
          </el-collapse>
          
          <div class="action-buttons">
            <el-button
              type="primary"
              size="large"
              @click="generateItinerary"
              :loading="isLoading"
              class="generate-btn"
            >
              <i class="el-icon-refresh-left"></i>
              生成行程
            </el-button>
          </div>
        </div>
        
        <div class="result-section" v-if="generatedTrip">
          <div class="trip-header">
            <h2>{{ generatedTrip.title }}</h2>
            <p class="trip-desc">{{ generatedTrip.description }}</p>
            <div class="trip-info">
              <el-tag size="small" class="info-tag">{{ generatedTrip.destination }}</el-tag>
              <el-tag size="small" class="info-tag">{{ formatDateRange(generatedTrip.startDate, generatedTrip.endDate) }}</el-tag>
              <el-tag size="small" class="info-tag">{{ generatedTrip.travelers }}人</el-tag>
              <el-tag size="small" class="info-tag">¥{{ generatedTrip.budget }}</el-tag>
            </div>
          </div>
          
          <div class="itinerary-days">
            <el-card v-for="(day, index) in generatedTrip.itinerary" :key="index" class="day-card">
              <template #header>
                <div class="card-header">
                  <span>第{{ index + 1 }}天 ({{ formatDate(day.date) }})</span>
                </div>
              </template>
              
              <div class="day-activities">
                <div v-for="(activity, actIndex) in day.activities" :key="actIndex" class="activity-item">
                  <div class="activity-time">{{ activity.time }}</div>
                  <div class="activity-content">
                    <h4>{{ activity.title }}</h4>
                    <p class="activity-location"><i class="el-icon-map-location"></i> {{ activity.location }}</p>
                    <p class="activity-notes">{{ activity.notes }}</p>
                    <p class="activity-cost" v-if="activity.cost">花费: ¥{{ activity.cost }}</p>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
          
          <div class="trip-suggestions" v-if="generatedTrip.suggestions && generatedTrip.suggestions.length > 0">
            <h3>旅行建议</h3>
            <ul>
              <li v-for="(suggestion, index) in generatedTrip.suggestions" :key="index">{{ suggestion }}</li>
            </ul>
          </div>
          
          <div class="save-section">
            <el-button
              type="primary"
              @click="saveTrip"
              icon="el-icon-save"
              :disabled="isSaving"
            >
              {{ isSaving ? '保存中...' : '保存行程' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import speechService from '../services/speechService'
import { tripAPI } from '../services/api'
import { aiService } from '../services/aiService'
import { useTripsStore } from '../store/trips'
import { useSettingsStore } from '../store/settings'

export default {
  name: 'PlannerView',
  setup() {
    const router = useRouter()
    const tripsStore = useTripsStore()
    const settingsStore = useSettingsStore()
    
    // 状态
    const tripRequirements = ref('')
    const isListening = ref(false)
    const isLoading = ref(false)
    const isSaving = ref(false)
    const activeNames = ref(['1'])
    const generatedTrip = ref(null)
    
    // 表单数据
    const form = reactive({
      destination: '',
      startDate: '',
      endDate: '',
      budget: 5000,
      travelers: 1,
      preferences: [],
      notes: ''
    })
    
    // 验证表单
    const validateForm = () => {
      if (!form.destination) {
        ElMessage.warning('请输入目的地')
        return false
      }
      
      if (!form.startDate || !form.endDate) {
        ElMessage.warning('请选择旅行日期')
        return false
      }
      
      if (new Date(form.startDate) > new Date(form.endDate)) {
        ElMessage.warning('结束日期必须晚于或等于开始日期')
        return false
      }
      
      // 计算日期差
      const startDate = new Date(form.startDate)
      const endDate = new Date(form.endDate)
      const dayDiff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))
      
      // 检查日期范围是否超过两天
      if (dayDiff > 2) {
        ElMessage.warning('因模型能力限制，时间暂时不可超过两天')
        return false
      }
      
      if (!form.budget || form.budget <= 0) {
        ElMessage.warning('请输入有效预算')
        return false
      }
      
      return true
    }
    
    // 语音服务实例
    let speechService = null
    
    // 初始化语音服务
    const initSpeechService = () => {
      if (!speechService) {
        // 导入 SpeechService
        import('../services/speechService').then(({ default: SpeechService }) => {
          // 创建实例，使用默认设置
          speechService = new SpeechService({
            language: 'zh-CN',
            continuous: false,
            interimResults: true
          })
        })
      }
      return speechService
    }

    // 切换语音识别
    const toggleVoiceRecognition = async () => {
      try {
        // 确保语音服务已初始化
        if (!speechService) {
          await new Promise(resolve => {
            const timer = setInterval(() => {
              if (initSpeechService()) {
                clearInterval(timer)
                resolve()
              }
            }, 100)
          })
        }
        
        if (isListening.value) {
          const result = speechService.stop()
          // stop方法不返回文本，保持现有功能
          isListening.value = false
        } else {
          isListening.value = true
          speechService.start(
            (result) => {
              tripRequirements.value = result.transcript
            },
            (error) => {
              console.error('语音识别错误:', error)
              ElMessage.error('语音识别失败，请重试')
              isListening.value = false
            },
            () => {
              isListening.value = false
            }
          )
        }
      } catch (error) {
        console.error('语音识别失败:', error)
        ElMessage.error('语音识别失败，请重试')
        isListening.value = false
      }
    }
    
    // 组件挂载时初始化语音服务
    onMounted(() => {
      initSpeechService()
    })
    
    // 解析需求文本
    const parseRequirements = () => {
      const text = tripRequirements.value.trim()
      if (!text) return
      
      // 简单的解析逻辑，实际应用中可以使用NLP
      // 提取目的地
      const destinationMatch = text.match(/我想去([^，,。\s]+)/)
      if (destinationMatch) {
        form.destination = destinationMatch[1]
      }
      
      // 提取天数
      const daysMatch = text.match(/(\d+)天/)
      if (daysMatch) {
        const days = parseInt(daysMatch[1])
        // 限制天数不超过3天（包括开始日期当天）
        const limitedDays = Math.min(days, 3)
        
        const today = new Date()
        form.startDate = today.toISOString().split('T')[0]
        const endDate = new Date(today)
        endDate.setDate(today.getDate() + limitedDays - 1)
        form.endDate = endDate.toISOString().split('T')[0]
        
        // 如果用户要求的天数超过限制，显示提示
        if (days > 3) {
          ElMessage.warning('因模型能力限制，已将行程天数调整为2天')
        }
      }
      
      // 提取预算
      const budgetMatch = text.match(/预算([\d.]+)万?元?/)
      if (budgetMatch) {
        let budget = parseFloat(budgetMatch[1])
        if (budgetMatch[0].includes('万')) {
          budget *= 10000
        }
        form.budget = Math.round(budget)
      }
      
      // 提取人数
      const peopleMatch = text.match(/([\d]+)人/)
      if (peopleMatch) {
        form.travelers = parseInt(peopleMatch[1])
      }
      
      // 提取偏好
      const preferences = []
      if (text.includes('美食')) preferences.push('美食')
      if (text.includes('购物')) preferences.push('购物')
      if (text.includes('历史') || text.includes('文化')) preferences.push('历史文化')
      if (text.includes('自然') || text.includes('风景')) preferences.push('自然风光')
      if (text.includes('休闲') || text.includes('度假')) preferences.push('休闲度假')
      if (text.includes('冒险')) preferences.push('冒险活动')
      if (text.includes('孩子') || text.includes('亲子')) preferences.push('亲子活动')
      if (text.includes('艺术') || text.includes('展览')) preferences.push('艺术展览')
      form.preferences = preferences
    }
    
    // 检查AI服务配置
    const isAiConfigured = computed(() => {
      return settingsStore.getApiKey !== ''
    })
    
    // 生成行程
    const generateItinerary = async () => {
      // 验证表单
      if (!validateForm()) return
      
      console.log('生成行程前检查 - 刷新设置前:', {
        localStorage_apiKey_exists: !!localStorage.getItem('ai_api_key'),
        localStorage_apiKey_preview: localStorage.getItem('ai_api_key') ? localStorage.getItem('ai_api_key').substring(0, 5) + '...' : '',
        settingsStore_provider: settingsStore.ai.provider,
        settingsStore_apiKey_exists: !!settingsStore.ai.apiKey
      })
      
      // 刷新设置，确保获取最新的API密钥
      const refreshedKey = settingsStore.refreshSettings()
      console.log('生成行程前检查 - 刷新设置后:', {
        refreshed_apiKey_exists: !!refreshedKey,
        refreshed_apiKey_preview: refreshedKey ? refreshedKey.substring(0, 5) + '...' : '',
        settingsStore_provider: settingsStore.ai.provider,
        settingsStore_apiKey_exists: !!settingsStore.ai.apiKey
      })
      
      // 检查AI服务配置
      if (!isAiConfigured.value) {
        ElMessageBox.alert(
          '您还未配置AI服务，请先在设置页面配置API密钥',
          '配置AI服务',
          {
            confirmButtonText: '去配置',
            callback: () => {
              router.push('/settings')
            }
          }
        )
        return
      }
      
      isLoading.value = true
      try {
        // 准备行程数据
        const tripData = {
          destination: form.destination,
          startDate: form.startDate,
          endDate: form.endDate,
          budget: form.budget,
          travelers: form.travelers,
          preferences: [...form.preferences, ...settingsStore.getTravelPreferences.interests],
          notes: form.notes
        }
        
        // 调用AI服务生成行程
        const result = await aiService.generateItinerary(tripData)
        
        // 转换为应用内使用的行程格式
        generatedTrip.value = convertToAppTripFormat(result, tripData)
        
        ElMessage.success('行程生成成功！')
      } catch (error) {
        console.error('生成行程失败:', error)
        ElMessage.error('生成行程失败，请重试')
      } finally {
        isLoading.value = false
      }
    }
    
    // 转换AI返回的数据为应用内使用的格式
    const convertToAppTripFormat = (aiResult, originalData) => {
      return {
        title: aiResult.title || `${originalData.destination}${calculateDays(originalData.startDate, originalData.endDate)}天深度游`,
        description: aiResult.description || `这是一份${originalData.destination}的${calculateDays(originalData.startDate, originalData.endDate)}天详细旅行计划，涵盖了当地主要景点、美食和文化体验，总预算${originalData.budget}元。`,
        destination: originalData.destination,
        startDate: originalData.startDate,
        endDate: originalData.endDate,
        budget: originalData.budget,
        travelers: originalData.travelers,
        status: 'planning',
        preferences: originalData.preferences,
        notes: originalData.notes,
        // 转换行程安排格式
        itinerary: (aiResult.itinerary || []).map(day => ({
          date: day.date,
          activities: (day.activities || []).map(activity => ({
            time: activity.time || '',
            title: activity.title || '',
            location: activity.location || '',
            notes: activity.description || activity.notes || '',
            cost: activity.cost || 0,
            category: activity.category || 'other'
          }))
        })),
        suggestions: aiResult.suggestions || [
          "建议提前预订热门景点门票以避免排队",
          "尝试使用当地公共交通，既经济又能体验当地生活",
          "随身携带转换插头和充电宝",
          "注意当地天气变化，做好相应准备"
        ],
        totalBudget: aiResult.totalBudget || originalData.budget,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
    
    // 计算旅行天数
    const calculateDays = (start, end) => {
      const startDate = new Date(start)
      const endDate = new Date(end)
      return Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
    
    // 格式化日期范围
    const formatDateRange = (start, end) => {
      return `${formatDate(start)} - ${formatDate(end)}`
    }
    
    // 保存行程
    const saveTrip = async () => {
      if (!generatedTrip.value) {
        ElMessage.warning('没有可保存的行程')
        return
      }
      
      isSaving.value = true
      try {
        // 保存到本地存储和状态管理
        await tripsStore.createTrip(generatedTrip.value)
        
        // 如果有API，也可以保存到服务器
        // await tripAPI.create(generatedTrip.value)
        
        ElMessage.success('行程保存成功！')
        
        ElMessageBox.confirm(
          '行程已保存，是否前往行程管理页面？',
          '保存成功',
          {
            confirmButtonText: '前往',
            cancelButtonText: '取消',
            type: 'info'
          }
        ).then(() => {
          router.push('/trips')
        }).catch(() => {})
      } catch (error) {
        console.error('保存行程失败:', error)
        ElMessage.error('保存行程失败，请重试')
      } finally {
        isSaving.value = false
      }
    }
    
    return {
      tripRequirements,
      isListening,
      isLoading,
      isSaving,
      activeNames,
      generatedTrip,
      form,
      toggleVoiceRecognition,
      parseRequirements,
      generateItinerary,
      saveTrip,
      formatDate,
      formatDateRange
    }
  }
}
</script>

<style scoped>
.planner-container {
  min-height: calc(100vh - 200px);
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  text-align: center;
  margin-bottom: 10px;
  color: #333;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
}

.planner-content {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.input-section {
  flex: 1;
  min-width: 400px;
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.result-section {
  flex: 1;
  min-width: 400px;
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.speech-input-container {
  margin-bottom: 20px;
}

.speech-input-box {
  margin-bottom: 15px;
}

.trip-input {
  margin-bottom: 10px;
}

.speech-controls {
  display: flex;
  gap: 10px;
}

.voice-btn {
  flex: 1;
}

.advanced-options {
  margin-top: 20px;
}

.advanced-form {
  margin-bottom: 20px;
}

.date-range {
  display: flex;
  gap: 20px;
}

.date-range .el-form-item {
  flex: 1;
}

.action-buttons {
  margin-top: 30px;
  text-align: center;
}

.generate-btn {
  width: 200px;
  font-size: 16px;
}

.trip-header {
  margin-bottom: 30px;
}

.trip-header h2 {
  margin-bottom: 10px;
  color: #333;
}

.trip-desc {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.6;
}

.trip-info {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.info-tag {
  background-color: #f0f9ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.itinerary-days {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.day-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
}

.day-activities {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 6px;
  transition: all 0.3s;
}

.activity-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.activity-time {
  width: 80px;
  font-weight: bold;
  color: #1890ff;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.activity-location {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.activity-notes {
  margin: 0 0 8px 0;
  color: #666;
  line-height: 1.6;
}

.activity-cost {
  margin: 0;
  color: #f56c6c;
  font-weight: bold;
}

.trip-suggestions {
  margin-bottom: 30px;
}

.trip-suggestions h3 {
  margin-bottom: 15px;
  color: #333;
}

.trip-suggestions ul {
  padding-left: 20px;
}

.trip-suggestions li {
  margin-bottom: 10px;
  color: #666;
  line-height: 1.6;
}

.save-section {
  text-align: center;
  margin-top: 30px;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .planner-content {
    flex-direction: column;
  }
  
  .input-section,
  .result-section {
    min-width: 100%;
  }
  
  .date-range {
    flex-direction: column;
    gap: 0;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 15px;
  }
  
  .input-section,
  .result-section {
    padding: 20px;
  }
  
  .activity-item {
    flex-direction: column;
    gap: 10px;
  }
  
  .activity-time {
    width: auto;
  }
}
</style>