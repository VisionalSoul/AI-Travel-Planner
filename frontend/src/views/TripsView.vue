<template>
  <div class="trips-container">
    <div class="page-header">
      <h2 class="page-title">我的行程</h2>
      <el-button type="primary" @click="createNewTrip">
        <el-icon><Plus /></el-icon>
        创建新行程
      </el-button>
    </div>
    
    <!-- 行程列表筛选 -->
    <div class="trip-filters">
      <el-input
        v-model="searchQuery"
        placeholder="搜索行程名称或目的地"
        prefix-icon="el-icon-search"
        clearable
        class="search-input"
      />
      
      <el-select
        v-model="statusFilter"
        placeholder="筛选状态"
        class="status-select"
        clearable
      >
        <el-option label="全部" value="" />
        <el-option label="计划中" value="planning" />
        <el-option label="进行中" value="ongoing" />
        <el-option label="已完成" value="completed" />
      </el-select>
      
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="date-picker"
        value-format="YYYY-MM-DD"
      />
    </div>
    
    <!-- 行程列表 -->
    <div class="trip-list" v-if="filteredTrips.length > 0">
      <div 
        v-for="trip in filteredTrips" 
        :key="trip.id" 
        class="trip-card"
        @click="viewTrip(trip.id)"
      >
        <div class="trip-image">
          <img 
            :src="getTripImage(trip)" 
            :alt="trip.title"
            class="trip-thumbnail"
          />
          <div class="trip-status" :class="trip.status">
            {{ getStatusText(trip.status) }}
          </div>
        </div>
        
        <div class="trip-info">
          <h3 class="trip-title">{{ trip.title }}</h3>
          
          <div class="trip-meta">
            <div class="meta-item">
              <el-icon class="meta-icon"><MapLocation /></el-icon>
              <span>{{ trip.destination }}</span>
            </div>
            
            <div class="meta-item">
              <el-icon class="meta-icon"><Calendar /></el-icon>
              <span>{{ formatDateRange(trip.startDate, trip.endDate) }}</span>
            </div>
            
            <div class="meta-item">
              <el-icon class="meta-icon"><Wallet /></el-icon>
              <span>预算: ¥{{ trip.budget }}</span>
            </div>
          </div>
          
          <div class="trip-description">{{ trip.description }}</div>
          
          <div class="trip-actions">
            <el-button size="small" type="primary" @click.stop="editTrip(trip)">
              编辑
            </el-button>
            <el-button size="small" @click.stop="shareTrip(trip.id)">
              分享
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click.stop="confirmDeleteTrip(trip.id, trip.title)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div class="empty-state" v-else-if="!isLoading">
      <el-empty
        description="暂无行程数据"
        :image-size="120"
      >
        <el-button type="primary" @click="createNewTrip">
          <el-icon><Plus /></el-icon>
          创建第一个行程
        </el-button>
      </el-empty>
    </div>
    
    <!-- 加载状态 -->
    <div class="loading-state" v-if="isLoading">
      <el-skeleton :count="3" :rows="4" animated />
    </div>
    
    <!-- 新建/编辑行程对话框 -->
    <el-dialog
      v-model="tripDialogVisible"
      :title="isEditing ? '编辑行程' : '创建新行程'"
      width="600px"
      center
    >
      <el-form
        ref="tripForm"
        :model="tripFormData"
        label-width="100px"
        :rules="tripFormRules"
      >
        <el-form-item label="行程标题" prop="title">
          <el-input v-model="tripFormData.title" placeholder="请输入行程标题" />
        </el-form-item>
        
        <el-form-item label="目的地" prop="destination">
          <el-input v-model="tripFormData.destination" placeholder="请输入目的地" />
        </el-form-item>
        
        <el-form-item label="行程日期" prop="dateRange">
          <el-date-picker
            v-model="tripFormData.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="预算金额" prop="budget">
          <el-input-number 
            v-model="tripFormData.budget" 
            :min="0" 
            :step="100" 
            placeholder="请输入预算金额"
            prefix-icon="el-icon-wallet"
          />
        </el-form-item>
        
        <el-form-item label="行程状态" prop="status">
          <el-select v-model="tripFormData.status" placeholder="请选择行程状态">
            <el-option label="计划中" value="planning" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="行程描述" prop="description">
          <el-input
            v-model="tripFormData.description"
            type="textarea"
            placeholder="请输入行程描述"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="closeTripDialog">取消</el-button>
        <el-button type="primary" @click="submitTripForm" :loading="isSubmitting">
          {{ isEditing ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
      center
    >
      <p>确定要删除行程 "{{ tripToDeleteName }}" 吗？此操作不可撤销。</p>
      
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="deleteTrip" :loading="isDeleting">
          确认删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTripsStore } from '../store/trips'
import { Plus, MapLocation, Calendar, Wallet } from '@element-plus/icons-vue'
import { tripAPI } from '../services/api'

export default {
  name: 'TripsView',
  components: {
    Plus,
    MapLocation,
    Calendar,
    Wallet
  },
  setup() {
    const router = useRouter()
    const tripsStore = useTripsStore()
    
    // 状态
    const isLoading = ref(false)
    const isSubmitting = ref(false)
    const isDeleting = ref(false)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const dateRange = ref(null)
    
    // 对话框状态
    const tripDialogVisible = ref(false)
    const isEditing = ref(false)
    const currentTripId = ref(null)
    
    const deleteDialogVisible = ref(false)
    const tripToDeleteId = ref(null)
    const tripToDeleteName = ref('')
    
    // 表单数据
    const tripFormData = reactive({
      title: '',
      destination: '',
      dateRange: null,
      budget: 0,
      status: 'planning',
      description: ''
    })
    
    // 表单验证规则
    const tripFormRules = {
      title: [
        { required: true, message: '请输入行程标题', trigger: 'blur' },
        { max: 100, message: '行程标题不能超过100个字符', trigger: 'blur' }
      ],
      destination: [
        { required: true, message: '请输入目的地', trigger: 'blur' }
      ],
      dateRange: [
        { required: true, message: '请选择行程日期', trigger: 'change' }
      ],
      budget: [
        { required: true, message: '请输入预算金额', trigger: 'blur' }
      ]
    }
    
    // 计算过滤后的行程列表
    const filteredTrips = computed(() => {
      return tripsStore.trips.filter(trip => {
        // 搜索查询过滤
        const matchesSearch = !searchQuery.value || 
          trip.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          trip.destination.toLowerCase().includes(searchQuery.value.toLowerCase())
        
        // 状态过滤
        const matchesStatus = !statusFilter.value || trip.status === statusFilter.value
        
        // 日期范围过滤
        const matchesDate = !dateRange.value || (
          trip.startDate >= dateRange.value[0] && trip.endDate <= dateRange.value[1]
        )
        
        return matchesSearch && matchesStatus && matchesDate
      })
    })
    
    // 获取行程图片
    const getTripImage = (trip) => {
      // 实际应用中应该从服务器获取图片或使用第三方图片服务
      // 这里使用一个简单的占位图逻辑
      const destinations = [
        { name: '日本', img: 'https://images.unsplash.com/photo-1542966332-6330a1038001' },
        { name: '泰国', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9' },
        { name: '巴黎', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a' },
        { name: '纽约', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' },
        { name: '伦敦', img: 'https://images.unsplash.com/photo-1534430480872-3ce884921bdf' },
      ]
      
      const found = destinations.find(d => trip.destination.includes(d.name))
      return found ? `${found.img}?auto=format&fit=crop&w=600&q=80` : 
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'
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
      
      // 计算天数
      const start = new Date(startDate)
      const end = new Date(endDate)
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
      
      return `${startDate} 至 ${endDate} (${days}天)`
    }
    
    // 加载行程列表
    const loadTrips = async () => {
      isLoading.value = true
      try {
        await tripsStore.fetchTrips()
        if (tripsStore.error) {
          ElMessage.error(tripsStore.error)
          tripsStore.clearError()
        }
      } catch (error) {
        console.error('加载行程失败:', error)
        ElMessage.error('加载行程失败，请重试')
      } finally {
        isLoading.value = false
      }
    }
    
    // 查看行程详情
    const viewTrip = (tripId) => {
      router.push(`/trips/${tripId}`)
    }
    
    // 创建新行程
    const createNewTrip = () => {
      isEditing.value = false
      currentTripId.value = null
      resetTripForm()
      tripDialogVisible.value = true
    }
    
    // 编辑行程
    const editTrip = (trip) => {
      isEditing.value = true
      currentTripId.value = trip.id
      
      // 填充表单数据
      tripFormData.title = trip.title
      tripFormData.destination = trip.destination
      tripFormData.dateRange = [trip.startDate, trip.endDate]
      tripFormData.budget = trip.budget
      tripFormData.status = trip.status
      tripFormData.description = trip.description
      
      tripDialogVisible.value = true
    }
    
    // 重置表单
    const resetTripForm = () => {
      tripFormData.title = ''
      tripFormData.destination = ''
      tripFormData.dateRange = null
      tripFormData.budget = 0
      tripFormData.status = 'planning'
      tripFormData.description = ''
    }
    
    // 关闭行程对话框
    const closeTripDialog = () => {
      tripDialogVisible.value = false
      resetTripForm()
    }
    
    // 提交行程表单
    const submitTripForm = async () => {
      // 表单验证
      if (!tripFormData.title || !tripFormData.destination || !tripFormData.dateRange) {
        ElMessage.warning('请填写必填项')
        return
      }
      
      isSubmitting.value = true
      try {
        const tripData = {
          title: tripFormData.title,
          destination: tripFormData.destination,
          startDate: tripFormData.dateRange[0],
          endDate: tripFormData.dateRange[1],
          budget: tripFormData.budget,
          status: tripFormData.status,
          description: tripFormData.description
        }
        
        if (isEditing.value) {
          // 更新行程
          await tripsStore.updateTrip(currentTripId.value, tripData)
          if (tripsStore.error) {
            throw new Error(tripsStore.error)
          }
          ElMessage.success('行程更新成功')
        } else {
          // 创建行程
          await tripsStore.addTrip(tripData)
          if (tripsStore.error) {
            throw new Error(tripsStore.error)
          }
          ElMessage.success('行程创建成功')
        }
        
        tripDialogVisible.value = false
        resetTripForm()
        tripsStore.clearError()
      } catch (error) {
        console.error('保存行程失败:', error)
        ElMessage.error(isEditing.value ? '更新行程失败' : '创建行程失败')
        tripsStore.clearError()
      } finally {
        isSubmitting.value = false
      }
    }
    
    // 确认删除行程
    const confirmDeleteTrip = (tripId, tripName) => {
      tripToDeleteId.value = tripId
      tripToDeleteName.value = tripName
      deleteDialogVisible.value = true
    }
    
    // 删除行程
    const deleteTrip = async () => {
      isDeleting.value = true
      try {
        await tripsStore.deleteTrip(tripToDeleteId.value)
        if (tripsStore.error) {
          throw new Error(tripsStore.error)
        }
        ElMessage.success('行程已删除')
        deleteDialogVisible.value = false
        tripsStore.clearError()
      } catch (error) {
        console.error('删除行程失败:', error)
        ElMessage.error('删除行程失败，请重试')
        tripsStore.clearError()
      } finally {
        isDeleting.value = false
      }
    }
    
    // 分享行程
    const shareTrip = (tripId) => {
      ElMessage.info('分享功能开发中...')
      // 实际应用中应该生成分享链接或打开分享选项
    }
    
    onMounted(() => {
      loadTrips()
    })
    
    return {
      isLoading,
      isSubmitting,
      isDeleting,
      searchQuery,
      statusFilter,
      dateRange,
      filteredTrips,
      tripDialogVisible,
      isEditing,
      tripFormData,
      tripFormRules,
      deleteDialogVisible,
      tripToDeleteName,
      getTripImage,
      getStatusText,
      formatDateRange,
      createNewTrip,
      editTrip,
      closeTripDialog,
      submitTripForm,
      confirmDeleteTrip,
      deleteTrip,
      shareTrip,
      viewTrip
    }
  }
}
</script>

<style scoped>
.trips-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.trip-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.status-select,
.date-picker {
  width: 200px;
}

.trip-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.trip-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.trip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.trip-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.trip-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.trip-card:hover .trip-thumbnail {
  transform: scale(1.05);
}

.trip-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
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

.trip-info {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.trip-title {
  font-size: 1.3rem;
  color: #333;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.trip-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #606266;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-icon {
  font-size: 0.9rem;
}

.trip-description {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-actions {
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
}

.empty-state,
.loading-state {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
  margin-top: 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .trip-filters {
    flex-direction: column;
  }
  
  .search-input,
  .status-select,
  .date-picker {
    width: 100%;
  }
  
  .trip-list {
    grid-template-columns: 1fr;
  }
  
  .trip-actions {
    flex-wrap: wrap;
  }
}
</style>