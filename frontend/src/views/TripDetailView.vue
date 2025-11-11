<template>
  <div class="trip-detail-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button @click="goBack" icon="el-icon-arrow-left" plain>
        返回行程列表
      </el-button>
    </div>
    
    <!-- 行程详情卡片 -->
    <div class="trip-detail-card" v-if="trip">
      <!-- 行程封面图 -->
      <div class="trip-header">
        <div class="trip-cover">
          <img :src="getTripImage(trip)" :alt="trip.title" class="cover-image" />
          <div class="trip-overlay">
            <div class="trip-status" :class="trip.status">
              {{ getStatusText(trip.status) }}
            </div>
          </div>
        </div>
        
        <!-- 行程基本信息 -->
        <div class="trip-title-section">
          <h1 class="trip-title">{{ trip.title }}</h1>
          <div class="trip-subtitle">{{ trip.destination }}</div>
          
          <div class="trip-meta">
            <div class="meta-item">
              <el-icon class="meta-icon"><Calendar /></el-icon>
              <span>{{ formatDateRange(trip.startDate, trip.endDate) }}</span>
            </div>
            
            <div class="meta-item">
              <el-icon class="meta-icon"><Wallet /></el-icon>
              <span>预算: ¥{{ trip.budget }}</span>
            </div>
            
            <div class="meta-item">
              <el-icon class="meta-icon"><Clock /></el-icon>
              <span>{{ getDaysCount(trip.startDate, trip.endDate) }}天</span>
            </div>
          </div>
          
          <div class="trip-actions">
            <el-button type="primary" @click="editTrip">
              <el-icon><Edit /></el-icon>
              编辑行程
            </el-button>
            <el-button @click="shareTrip">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
            <el-button @click="addBudget">
              <el-icon><Wallet /></el-icon>
              管理预算
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 行程描述 -->
      <div class="trip-description-section">
        <h2 class="section-title">行程描述</h2>
        <p class="description-content">{{ trip.description || '暂无行程描述' }}</p>
      </div>
      
      <!-- 行程地图 -->
      <div class="trip-map-section">
        <h2 class="section-title">行程地图</h2>
        <div class="map-container">
          <MapComponent
            ref="mapComponentRef"
            :markers="mapMarkers"
            :center="trip.destinationCoordinates || [116.397428, 39.90923]"
            height="400px"
            @marker-click="handleMarkerClick"
          />
        </div>
      </div>
      
      <!-- 行程安排 -->
      <div class="trip-itinerary-section">
        <div class="section-header">
          <h2 class="section-title">行程安排</h2>
          <el-button type="primary" size="small" @click="addItineraryDay">
            <el-icon><Plus /></el-icon>
            添加日程
          </el-button>
        </div>
        
        <div class="itinerary-days" v-if="processedItinerary && processedItinerary.length > 0">
          <div 
            v-for="(day, index) in processedItinerary" 
            :key="index" 
            class="itinerary-day"
          >
            <div class="day-header">
              <div class="day-number">第 {{ index + 1 }} 天</div>
              <div class="day-date">{{ formatDayDate(trip.startDate, index) }}</div>
              <div class="day-actions">
                <el-button size="small" @click="editItineraryDay(index)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button size="small" type="danger" @click="deleteItineraryDay(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            
            <div class="day-activities">
              <div 
                v-for="(activity, actIndex) in day.activities" 
                :key="actIndex" 
                class="activity-item"
              >
                <div class="activity-time">{{ activity.time }}</div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-location" v-if="activity.location">
                    <el-icon class="location-icon"><MapLocation /></el-icon>
                    {{ activity.location }}
                  </div>
                  <div class="activity-notes" v-if="activity.notes">
                    {{ activity.notes }}
                  </div>
                </div>
              </div>
              
              <div class="no-activities" v-if="!day.activities || day.activities.length === 0">
                暂无安排
                <el-button size="small" @click="addActivity(index)">
                  添加活动
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="empty-itinerary" v-else>
          <el-empty description="暂无行程安排" :image-size="100">
            <el-button type="primary" @click="addItineraryDay">
              <el-icon><Plus /></el-icon>
              添加第一天行程
            </el-button>
          </el-empty>
        </div>
      </div>
      
      <!-- 费用记录 -->
      <div class="trip-expenses-section">
        <div class="section-header">
          <h2 class="section-title">费用记录</h2>
          <el-button type="primary" size="small" @click="addExpense">
            <el-icon><Plus /></el-icon>
            添加费用
          </el-button>
        </div>
        
        <el-table 
          v-if="trip.expenses && trip.expenses.length > 0" 
          :data="trip.expenses" 
          style="width: 100%"
        >
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="amount" label="金额" width="120" align="right">
            <template #default="scope">¥{{ scope.row.amount }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteExpense(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="budget-summary" v-if="trip.expenses && trip.expenses.length > 0">
          <div class="budget-item">
            <div class="budget-label">预算总额</div>
            <div class="budget-value">¥{{ trip?.budget || 0 }}</div>
          </div>
          <div class="budget-item">
            <div class="budget-label">已花费</div>
            <div class="budget-value">¥{{ getTotalExpenses() }}</div>
          </div>
          <div class="budget-item" :class="getBudgetStatusClass()">
            <div class="budget-label">剩余预算</div>
            <div class="budget-value">¥{{ getRemainingBudget() }}</div>
          </div>
          <button class="analysis-btn" @click="toggleExpenseAnalysis">
            {{ showExpenseAnalysis ? '隐藏分析' : '费用分析' }}
          </button>
        </div>
        
        <!-- 费用分析组件 -->
        <div v-if="showExpenseAnalysis" class="expense-analysis-container">
          <ExpenseAnalysis :trip-id="tripId" />
        </div>
        
        <div class="empty-expenses" v-else>
          <el-empty description="暂无费用记录" :image-size="100">
            <el-button type="primary" @click="addExpense">
              <el-icon><Plus /></el-icon>
              添加费用记录
            </el-button>
          </el-empty>
        </div>
      </div>
      
      <!-- 旅行照片 -->
      <div class="trip-photos-section">
        <h2 class="section-title">旅行照片</h2>
        
        <div class="photo-gallery">
          <div 
            v-for="(photo, index) in trip.photos || []" 
            :key="index" 
            class="photo-item"
          >
            <img :src="photo.url" :alt="photo.description || '旅行照片'" class="photo-image" />
            <div class="photo-overlay">
              <el-button size="small" type="danger" @click.stop="deletePhoto(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          
          <div class="add-photo" @click="uploadPhoto">
            <el-icon class="add-icon"><Plus /></el-icon>
            <div class="add-text">添加照片</div>
            <input 
              type="file" 
              ref="fileInput" 
              style="display: none" 
              accept="image/*" 
              multiple
              @change="handleFileUpload"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div class="loading-state" v-else-if="isLoading">
      <el-skeleton :rows="10" animated />
    </div>
    
    <!-- 行程不存在 -->
    <div class="not-found" v-else>
      <el-empty description="未找到行程" :image-size="120">
        <el-button type="primary" @click="goBack">
          返回行程列表
        </el-button>
      </el-empty>
    </div>
    
    <!-- 添加/编辑日程对话框 -->
    <el-dialog
      v-model="itineraryDialogVisible"
      :title="editingItineraryIndex !== null ? '编辑日程' : '添加日程'"
      width="500px"
      center
    >
      <el-form :model="itineraryForm" label-width="80px">
        <el-form-item label="日期">
          <el-date-picker
            v-model="itineraryForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            disabled
          />
        </el-form-item>
        
        <el-form-item label="活动">
          <div 
            v-for="(activity, index) in itineraryForm.activities" 
            :key="index" 
            class="activity-form-item"
          >
            <el-input
              v-model="activity.time"
              placeholder="时间 (例如: 09:00)"
              class="activity-time-input"
            />
            <el-input
              v-model="activity.title"
              placeholder="活动标题"
              class="activity-title-input"
            />
            <el-input
              v-model="activity.location"
              placeholder="地点"
              class="activity-location-input"
            />
            <el-input
              v-model="activity.notes"
              type="textarea"
              placeholder="备注"
              :rows="2"
              class="activity-notes-input"
            />
            <el-button 
              type="danger" 
              icon="el-icon-delete" 
              size="small" 
              @click="removeActivity(index)"
              v-if="itineraryForm.activities.length > 1"
            />
          </div>
          
          <el-button type="primary" size="small" @click="addActivityToForm">
            <el-icon><Plus /></el-icon>
            添加活动
          </el-button>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="itineraryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveItinerary">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 添加费用对话框 -->
    <el-dialog
      v-model="expenseDialogVisible"
      title="添加费用"
      width="400px"
      center
    >
      <el-form :model="expenseForm" label-width="80px">
        <el-form-item label="日期">
          <el-date-picker
            v-model="expenseForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="分类">
          <el-select v-model="expenseForm.category" placeholder="选择分类">
            <el-option label="交通" value="transportation" />
            <el-option label="住宿" value="accommodation" />
            <el-option label="餐饮" value="food" />
            <el-option label="景点门票" value="tickets" />
            <el-option label="购物" value="shopping" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input v-model="expenseForm.description" placeholder="费用描述" />
        </el-form-item>
        
        <el-form-item label="金额">
          <el-input-number 
            v-model="expenseForm.amount" 
            :min="0" 
            :step="0.01" 
            placeholder="输入金额"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="expenseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveExpense">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { useTripsStore } from '../store/trips'
import { useSettingsStore } from '../store/settings'
import { useExpensesStore } from '../store/expenses'
import { Calendar, Wallet, Clock, Edit, Share, Plus, Delete, MapLocation } from '@element-plus/icons-vue'
import MapComponent from '../components/MapComponent.vue'
import ExpenseAnalysis from '../components/ExpenseAnalysis.vue'
import mapService from '../services/mapService'

export default {
  name: 'TripDetailView',
  components: {
    Calendar,
    Wallet,
    Clock,
    Edit,
    Share,
    Plus,
    Delete,
    MapLocation,
    MapComponent,
    ExpenseAnalysis
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const tripsStore = useTripsStore()
    const settingsStore = useSettingsStore()
    const expensesStore = useExpensesStore()
    const mapComponentRef = ref(null)
    
    // 状态
    const isLoading = ref(false)
    const tripId = computed(() => props.id || route.params.id)
    const fileInput = ref(null)
    const mapMarkers = ref([])
    const showExpenseAnalysis = ref(false)
    
    // 对话框状态
    const itineraryDialogVisible = ref(false)
    const editingItineraryIndex = ref(null)
    const expenseDialogVisible = ref(false)
    
    // 表单数据
    const itineraryForm = reactive({
      date: '',
      activities: [
        {
          time: '',
          title: '',
          location: '',
          notes: ''
        }
      ]
    })
    
    const expenseForm = reactive({
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: 0
    })
    
    // 获取行程数据
    const trip = computed(() => {
      return tripsStore.getTripById(tripId.value)
    })
    
    // 处理后的行程安排数据（确保是对象数组格式）
    const processedItinerary = computed(() => {
      if (!trip.value?.itinerary) return []
      
      // 检查并解析itinerary数据
      if (typeof trip.value.itinerary === 'string') {
        try {
          return JSON.parse(trip.value.itinerary)
        } catch (error) {
          console.error('解析itinerary数据失败:', error)
          return []
        }
      }
      
      return trip.value.itinerary
    })
    
    // 获取所有活动
    const getAllActivities = () => {
      const activities = []
      if (!trip.value?.itinerary) return activities
      
      // 检查并解析itinerary数据，如果是JSON字符串则转换为对象数组
      let itinerary = trip.value.itinerary
      if (typeof itinerary === 'string') {
        try {
          itinerary = JSON.parse(itinerary)
        } catch (error) {
          console.error('解析itinerary数据失败:', error)
          return activities
        }
      }
      
      itinerary.forEach((day, dayIndex) => {
        if (day.activities) {
          day.activities.forEach(activity => {
            if (activity.location) {
              activities.push({
                ...activity,
                day: dayIndex + 1,
                date: formatDayDate(trip.value.startDate, dayIndex)
              })
            }
          })
        }
      })
      
      return activities
    }
    
    // 监听行程变化，更新地图标记
    watch(() => trip.value, (newTrip) => {
      if (newTrip && mapComponentRef.value) {
        mapComponentRef.value.updateMarkers(getAllActivities())
      }
    }, { deep: true })
    
    // 获取行程图片
    const getTripImage = (trip) => {
      // 实际应用中应该从服务器获取图片或使用第三方图片服务
      const destinations = [
        { name: '日本', img: 'https://images.unsplash.com/photo-1542966332-6330a1038001' },
        { name: '泰国', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9' },
        { name: '巴黎', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a' },
        { name: '纽约', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' },
        { name: '伦敦', img: 'https://images.unsplash.com/photo-1534430480872-3ce884921bdf' },
      ]
      
      const found = destinations.find(d => trip.destination.includes(d.name))
      return found ? `${found.img}?auto=format&fit=crop&w=1200&q=80` : 
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'planning': '计划中',
        'ongoing': '进行中',
        'completed': '已完成'
      }
      return statusMap[status] || '未知'
    }
    
    // 格式化日期范围
    const formatDateRange = (startDate, endDate) => {
      if (!startDate || !endDate) return ''
      return `${startDate} 至 ${endDate}`
    }
    
    // 计算天数
    const getDaysCount = (startDate, endDate) => {
      if (!startDate || !endDate) return 0
      const start = new Date(startDate)
      const end = new Date(endDate)
      return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
    }
    
    // 格式化单日日期
    const formatDayDate = (startDate, dayIndex) => {
      if (!startDate) return ''
      const date = new Date(startDate)
      date.setDate(date.getDate() + dayIndex)
      return date.toISOString().split('T')[0]
    }
    

    
    // 加载行程费用
    const loadTripExpenses = async () => {
      if (!tripId.value) return
      await expensesStore.fetchExpensesByTripId(tripId.value)
      // 设置预算
      if (trip.value && trip.value.budget) {
        expensesStore.setBudget(trip.value.budget)
      }
    }
    
    // 处理地图标记点击
    const handleMarkerClick = (markerData) => {
      ElMessage.info(`您选择了: ${markerData.title || '未知地点'}`)
      // 这里可以添加更多交互逻辑，如滚动到对应活动等
    }
    
    // 监听行程数据变化，更新地图标记
    watch(() => trip.value, (newTrip) => {
      if (newTrip) {
        mapMarkers.value = getAllActivities()
        // 更新预算
        if (newTrip.budget) {
          expensesStore.setBudget(newTrip.budget)
        }
      }
    }, { deep: true })
    
    // 使用expensesStore的计算属性
    const getTotalExpenses = () => {
      return expensesStore.totalExpenses
    }
    
    // 计算剩余预算
    const getRemainingBudget = () => {
      return expensesStore.remainingBudget
    }
    
    // 获取预算状态类
    const getBudgetStatusClass = () => {
      switch (expensesStore.budgetStatus) {
        case 'over_budget':
          return 'budget-exceeded'
        case 'warning':
          return 'budget-low'
        default:
          return 'budget-healthy'
      }
    }
    
    // 切换费用分析视图
    const toggleExpenseAnalysis = () => {
      showExpenseAnalysis.value = !showExpenseAnalysis.value
    }
    
    // 加载行程详情
    const loadTripDetail = async () => {
      if (!tripId.value) return
      
      isLoading.value = true
      try {
        await tripsStore.fetchTrip(tripId.value)
        
        // 加载行程费用
        await loadTripExpenses()
      } catch (error) {
        console.error('加载行程详情失败:', error)
        ElMessage.error('加载行程详情失败，请重试')
      } finally {
        isLoading.value = false
      }
    }
    
    // 返回上一页
    const goBack = () => {
      router.push('/trips')
    }
    
    // 编辑行程
    const editTrip = () => {
      router.push(`/trips/edit/${tripId.value}`)
    }
    
    // 分享行程
    const shareTrip = () => {
      ElMessage.info('分享功能开发中...')
      // 实际应用中应该生成分享链接或打开分享选项
    }
    
    // 管理预算
    const addBudget = () => {
      expenseDialogVisible.value = true
    }
    
    // 添加行程日
    const addItineraryDay = () => {
      const days = processedItinerary.value.length || 0
      const date = formatDayDate(trip.value.startDate, days)
      
      editingItineraryIndex.value = null
      itineraryForm.date = date
      itineraryForm.activities = [{
        time: '',
        title: '',
        location: '',
        notes: ''
      }]
      
      itineraryDialogVisible.value = true
    }
    
    // 编辑行程日
    const editItineraryDay = (index) => {
      const days = processedItinerary.value || []
      const day = days[index]
      
      if (!day) return
      
      editingItineraryIndex.value = index
      itineraryForm.date = formatDayDate(trip.value.startDate, index)
      itineraryForm.activities = JSON.parse(JSON.stringify(day.activities || []))
      
      itineraryDialogVisible.value = true
    }
    
    // 添加活动到表单
    const addActivityToForm = () => {
      itineraryForm.activities.push({
        time: '',
        title: '',
        location: '',
        notes: ''
      })
    }
    
    // 从表单移除活动
    const removeActivity = (index) => {
      itineraryForm.activities.splice(index, 1)
    }
    
    // 保存行程
    const saveItinerary = async () => {
      // 验证表单
      const hasValidActivity = itineraryForm.activities.some(act => 
        act.title.trim() !== ''
      )
      
      if (!hasValidActivity) {
        ElMessage.warning('请至少添加一个有效活动')
        return
      }
      
      // 过滤掉无效活动
      const validActivities = itineraryForm.activities.filter(act => 
        act.title.trim() !== ''
      )
      
      // 构建日程数据
      const dayData = {
        date: itineraryForm.date,
        activities: validActivities
      }
      
      // 更新行程数据
      const updatedTrip = { ...trip.value }
      let itinerary = processedItinerary.value
      
      if (editingItineraryIndex.value !== null) {
        // 更新现有日程
        itinerary[editingItineraryIndex.value] = dayData
      } else {
        // 添加新日程
        itinerary.push(dayData)
      }
      
      // 保持原始数据类型，以便后端处理
      if (typeof updatedTrip.itinerary === 'string') {
        updatedTrip.itinerary = JSON.stringify(itinerary)
      } else {
        updatedTrip.itinerary = itinerary
      }
      
      try {
        // 更新store
        await tripsStore.updateTrip(tripId.value, updatedTrip)
        ElMessage.success('日程保存成功')
        itineraryDialogVisible.value = false
      } catch (error) {
        console.error('保存日程失败:', error)
        ElMessage.error('保存日程失败，请重试')
      }
    }
    
    // 删除行程日
    const deleteItineraryDay = async (index) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除这一天的行程安排吗？',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const updatedTrip = { ...trip.value }
        // 确保使用处理后的数据格式
        const itinerary = processedItinerary.value.filter((_, i) => i !== index)
        
        // 保持原始数据类型，以便后端处理
        if (typeof updatedTrip.itinerary === 'string') {
          updatedTrip.itinerary = JSON.stringify(itinerary)
        } else {
          updatedTrip.itinerary = itinerary
        }
        
        await tripsStore.updateTrip(tripId.value, updatedTrip)
        ElMessage.success('日程已删除')
      } catch (error) {
        // 用户取消删除时不显示错误
      }
    }
    
    // 添加活动
    const addActivity = (dayIndex) => {
      editItineraryDay(dayIndex)
    }
    
    // 添加费用
    const addExpense = () => {
      expenseForm.date = new Date().toISOString().split('T')[0]
      expenseForm.category = ''
      expenseForm.description = ''
      expenseForm.amount = 0
      expenseDialogVisible.value = true
    }
    
    // 保存费用
    const saveExpense = async () => {
      // 验证表单
      if (!expenseForm.date || !expenseForm.category || !expenseForm.amount) {
        ElMessage.warning('请填写完整的费用信息')
        return
      }
      
      try {
        // 使用expensesStore添加费用
        await expensesStore.addExpense(tripId.value, {
          date: expenseForm.date,
          category: expenseForm.category,
          description: expenseForm.description,
          amount: parseFloat(expenseForm.amount)
        })
        
        // 同时更新trip数据以保持UI同步
        if (!trip.value.expenses) {
          trip.value.expenses = []
        }
        trip.value.expenses = [...expensesStore.currentTripExpenses]
        
        ElMessage.success('费用记录保存成功')
        expenseDialogVisible.value = false
      } catch (error) {
        console.error('保存费用记录失败:', error)
        ElMessage.error('保存费用记录失败，请重试')
      }
    }
    

    
    // 删除费用
    const deleteExpense = async (index) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除这条费用记录吗？',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const expenseToDelete = trip.value.expenses[index]
        if (expenseToDelete._id) {
          // 使用expensesStore删除费用
          await expensesStore.deleteExpense(expenseToDelete._id)
        } else {
          // 对于本地生成的记录，直接删除
          const updatedTrip = { ...trip.value }
          updatedTrip.expenses.splice(index, 1)
          await tripsStore.updateTrip(tripId.value, updatedTrip)
        }
        
        // 更新本地trip数据
        trip.value.expenses = [...expensesStore.currentTripExpenses]
        
        ElMessage.success('费用记录已删除')
      } catch (error) {
        // 用户取消删除时不显示错误
      }
    }
    
    // 上传照片
    const uploadPhoto = () => {
      fileInput.value.click()
    }
    
    // 处理文件上传
    const handleFileUpload = async (event) => {
      const files = event.target.files
      if (!files || files.length === 0) return
      
      // 更新行程数据
      const updatedTrip = { ...trip.value }
      if (!updatedTrip.photos) {
        updatedTrip.photos = []
      }
      
      // 使用FileReader来预览本地图片
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          updatedTrip.photos.push({
            id: Date.now().toString() + i,
            url: e.target.result,
            description: ''
          })
          try {
            await tripsStore.updateTrip(tripId.value, updatedTrip)
          } catch (error) {
            console.error('上传照片失败:', error)
            ElMessage.error('上传照片失败，请重试')
          }
        }
        reader.readAsDataURL(files[i])
      }
      
      // 清空文件输入
      event.target.value = ''
      ElMessage.success(`成功添加 ${files.length} 张照片`)
    }
    
    // 删除照片
    const deletePhoto = async (index) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除这张照片吗？',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const updatedTrip = { ...trip.value }
        updatedTrip.photos.splice(index, 1)
        await tripsStore.updateTrip(tripId.value, updatedTrip)
        ElMessage.success('照片已删除')
      } catch (error) {
        // 用户取消删除时不显示错误
      }
    }
    
    // 初始化
    onMounted(() => {
      loadTripDetail()
    })
    
    return {
      // 状态
      isLoading,
      trip,
      processedItinerary,
      tripId,
      fileInput,
      itineraryDialogVisible,
      editingItineraryIndex,
      itineraryForm,
      expenseDialogVisible,
      expenseForm,
      mapMarkers,
      mapComponentRef,
      settingsStore,
      expensesStore,
      showExpenseAnalysis,
      
      // 计算属性
      getTripImage,
      getStatusText,
      formatDateRange,
      getDaysCount,
      formatDayDate,
      getTotalExpenses,
      getRemainingBudget,
      getBudgetStatusClass,
      
      // 方法
      loadTripDetail,
      goBack,
      editTrip,
      shareTrip,
      addBudget,
      addItineraryDay,
      editItineraryDay,
      addActivityToForm,
      removeActivity,
      saveItinerary,
      deleteItineraryDay,
      addActivity,
      addExpense,
      saveExpense,
      deleteExpense,
      uploadPhoto,
      handleFileUpload,
      deletePhoto,
      handleMarkerClick,
      getAllActivities,
      toggleExpenseAnalysis
    }
  }
}
</script>

<style scoped>
.trip-detail-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.back-button {
  margin-bottom: 1.5rem;
}

.trip-detail-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.trip-header {
  position: relative;
}

.trip-cover {
  height: 300px;
  position: relative;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
}

.trip-status {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
}

.trip-status.planning {
  background-color: #409eff;
}

.trip-status.ongoing {
  background-color: #67c23a;
}

.trip-status.completed {
  background-color: #909399;
}

.trip-title-section {
  padding: 2rem;
  color: white;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.trip-title {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.trip-subtitle {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.trip-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.meta-icon {
  font-size: 1.2rem;
}

.trip-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* 通用区块样式 */
.trip-description-section,
.trip-map-section,
.trip-itinerary-section,
.trip-expenses-section,
.trip-photos-section {
  padding: 2rem;
  border-top: 1px solid #f0f0f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 1.5rem 0;
}

/* 描述区块 */
.description-content {
  color: #606266;
  line-height: 1.8;
  font-size: 1.05rem;
}

/* 地图区块 */
.map-container {
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 行程安排 */
.itinerary-days {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.itinerary-day {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  overflow: hidden;
}

.day-header {
  background-color: #f5f7fa;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
}

.day-number {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
}

.day-date {
  color: #606266;
  font-size: 0.9rem;
}

.day-activities {
  padding: 1.5rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed #e6e6e6;
}

.activity-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.activity-time {
  min-width: 60px;
  font-weight: 500;
  color: #667eea;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.activity-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #606266;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.location-icon {
  font-size: 0.8rem;
  color: #f56c6c;
}

.activity-notes {
  color: #909399;
  font-size: 0.9rem;
  line-height: 1.5;
}

.no-activities {
  text-align: center;
  padding: 2rem;
  color: #909399;
}

.empty-itinerary {
  text-align: center;
  padding: 3rem;
}

/* 费用记录 */
.budget-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  align-items: center;
}

.budget-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.budget-label {
  font-size: 14px;
  color: #606266;
}

.budget-value {
  font-size: 18px;
  font-weight: 600;
}

.budget-exceeded .budget-value {
  color: #f56c6c;
}

.budget-low .budget-value {
  color: #e6a23c;
}

.budget-healthy .budget-value {
  color: #67c23a;
}

.analysis-btn {
  margin-left: auto;
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.analysis-btn:hover {
  background-color: #66b1ff;
}

.expense-analysis-container {
  margin-top: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-expenses {
  text-align: center;
  padding: 3rem;
}

/* 照片展示 */
.photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.photo-item {
  position: relative;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.photo-item:hover .photo-image {
  transform: scale(1.1);
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.add-photo {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  cursor: pointer;
  transition: all 0.3s;
}

.add-photo:hover {
  border-color: #667eea;
  color: #667eea;
}

.add-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.add-text {
  font-size: 0.9rem;
}

/* 表单样式 */
.activity-form-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}

.activity-time-input,
.activity-title-input,
.activity-location-input {
  margin-bottom: 0.8rem;
}

/* 加载状态 */
.loading-state,
.not-found {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  margin-top: 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-cover {
    height: 200px;
  }
  
  .trip-title {
    font-size: 2rem;
  }
  
  .trip-subtitle {
    font-size: 1rem;
  }
  
  .trip-meta {
    gap: 1rem;
    font-size: 0.9rem;
  }
  
  .trip-actions {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .day-header {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .expense-summary {
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
  }
  
  .photo-gallery {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .map-container {
    height: 300px;
  }
}
</style>