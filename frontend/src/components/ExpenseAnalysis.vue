<template>
  <div class="expense-analysis">
    <!-- 预算概览卡片 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="overview-card">
          <template #header>
            <div class="card-header">
              <span>总预算</span>
              <el-icon class="card-icon"><Wallet /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <div class="amount">¥{{ formatCurrency(budget) }}</div>
            <div class="subtext">旅行预算总额</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="overview-card">
          <template #header>
            <div class="card-header">
              <span>已花费</span>
              <el-icon class="card-icon"><Coin /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <div class="amount spent">¥{{ formatCurrency(totalExpenses) }}</div>
            <div class="subtext">当前支出总额</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="overview-card" :class="`budget-status-${budgetStatus}`">
          <template #header>
            <div class="card-header">
              <span>剩余预算</span>
              <el-icon class="card-icon"><TrendCharts /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <div class="amount remaining" :class="{ negative: remainingBudget < 0 }">
              ¥{{ formatCurrency(Math.abs(remainingBudget)) }}
              <span v-if="remainingBudget < 0" class="negative-label">超支</span>
            </div>
            <div class="subtext">预算余额</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 预算使用进度条 -->
    <el-card class="progress-card">
      <div class="progress-header">
        <span>预算使用情况</span>
        <span class="percentage">{{ budgetUsagePercentage }}%</span>
      </div>
      <el-progress 
        :percentage="Math.min(budgetUsagePercentage, 100)" 
        :color="getProgressColor()"
        :show-text="false"
        class="budget-progress"
      />
      <div class="budget-status-text">{{ getBudgetStatusText() }}</div>
    </el-card>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-section">
      <!-- 费用分类饼图 -->
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>费用分类占比</span>
            </div>
          </template>
          <div v-if="expensesByCategory.length > 0" class="chart-container">
            <el-statistic
              v-for="(item, index) in expensesByCategory"
              :key="index"
              class="category-stat"
              :title="item.name"
              :value="item.value"
              :precision="0"
              :prefix="'¥'"
              :suffix="` (${item.percentage}%)`"
            />
          </div>
          <el-empty v-else description="暂无费用数据" :image-size="100" />
        </el-card>
      </el-col>
      
      <!-- 每日费用趋势 -->
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>每日费用趋势</span>
            </div>
          </template>
          <div v-if="dailyExpenses.length > 0" class="chart-container">
            <div v-for="(item, index) in dailyExpenses" :key="index" class="daily-expense-item">
              <div class="date-label">{{ formatShortDate(item.date) }}</div>
              <div class="expense-bar-container">
                <div 
                  class="expense-bar" 
                  :style="{ width: `${getBarWidth(item.amount)}%` }"
                ></div>
                <span class="expense-amount">¥{{ formatCurrency(item.amount) }}</span>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无费用数据" :image-size="100" />
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 预算建议 -->
    <el-card v-if="budgetAnalysis && (budgetAnalysis.savingSuggestions || budgetAnalysis.adjustmentRecommendations)" class="suggestions-card">
      <template #header>
        <div class="card-header">
          <span>预算优化建议</span>
          <el-icon class="card-icon"><Star /></el-icon>
        </div>
      </template>
      
      <div v-if="budgetAnalysis.savingSuggestions" class="suggestions-section">
        <h3>省钱建议</h3>
        <ul class="suggestions-list">
          <li v-for="(suggestion, index) in budgetAnalysis.savingSuggestions" :key="index">
            <el-icon class="suggestion-icon"><Check /></el-icon>
            {{ suggestion }}
          </li>
        </ul>
      </div>
      
      <div v-if="budgetAnalysis.adjustmentRecommendations" class="recommendation-section">
        <h3>预算调整建议</h3>
        <div class="recommendation-text">
          <el-icon class="suggestion-icon"><Warning /></el-icon>
          {{ budgetAnalysis.adjustmentRecommendations }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { computed } from 'vue'
import { Wallet, TrendCharts, Star, Check, Warning, Coin } from '@element-plus/icons-vue'
import { useExpensesStore } from '../store/expenses'

export default {
  name: 'ExpenseAnalysis',
  components: {
    Wallet,
    Coin,
    TrendCharts,
    Star,
    Check,
    Warning
  },
  props: {
    tripId: {
      type: String,
      required: true
    },
    budget: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const expensesStore = useExpensesStore()
    
    // 计算属性
    const totalExpenses = computed(() => expensesStore.totalExpenses)
    const remainingBudget = computed(() => expensesStore.remainingBudget)
    const budgetUsagePercentage = computed(() => expensesStore.budgetUsagePercentage)
    const budgetStatus = computed(() => expensesStore.budgetStatus)
    const budgetAnalysis = computed(() => expensesStore.budgetAnalysis)
    
    // 格式化数据
    const expensesByCategory = computed(() => {
      const categories = expensesStore.expensesByCategory
      const total = totalExpenses.value
      return Object.entries(categories).map(([category, amount]) => ({
        name: getCategoryName(category),
        value: amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0
      }))
    })
    
    const dailyExpenses = computed(() => expensesStore.dailyExpenses)
    
    // 方法
    const formatCurrency = (value) => {
      return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    }
    
    const formatShortDate = (dateString) => {
      const date = new Date(dateString)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
    
    const getCategoryName = (category) => {
      const categoryMap = {
        transportation: '交通',
        accommodation: '住宿',
        food: '餐饮',
        activities: '活动',
        shopping: '购物',
        other: '其他'
      }
      return categoryMap[category] || category
    }
    
    const getBarWidth = (amount) => {
      const maxAmount = Math.max(...dailyExpenses.value.map(item => item.amount))
      return maxAmount > 0 ? (amount / maxAmount) * 100 : 0
    }
    
    const getProgressColor = () => {
      const percentage = budgetUsagePercentage.value
      if (percentage >= 90) return '#f56c6c'
      if (percentage >= 70) return '#e6a23c'
      return '#67c23a'
    }
    
    const getBudgetStatusText = () => {
      switch (budgetStatus.value) {
        case 'over_budget':
          return '预算已超支，请控制支出'
        case 'on_track':
          return '预算使用正常，继续保持'
        case 'under_budget':
          return '预算充足，可以适当安排更多活动'
        default:
          return '预算使用正常'
      }
    }
    
    return {
      totalExpenses,
      remainingBudget,
      budgetUsagePercentage,
      budgetStatus,
      budgetAnalysis,
      expensesByCategory,
      dailyExpenses,
      formatCurrency,
      formatShortDate,
      getBarWidth,
      getProgressColor,
      getBudgetStatusText
    }
  }
}
</script>

<style scoped>
.expense-analysis {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.overview-card {
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-icon {
  color: #667eea;
  font-size: 18px;
}

.card-content {
  padding: 20px 0;
}

.amount {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.amount.spent {
  color: #e6a23c;
}

.amount.remaining {
  color: #67c23a;
}

.amount.negative {
  color: #f56c6c;
}

.negative-label {
  font-size: 14px;
  margin-left: 8px;
  font-weight: normal;
  color: #f56c6c;
}

.subtext {
  color: #909399;
  font-size: 14px;
}

.budget-status-over_budget {
  border-left: 4px solid #f56c6c;
}

.budget-status-on_track {
  border-left: 4px solid #e6a23c;
}

.budget-status-under_budget {
  border-left: 4px solid #67c23a;
}

.progress-card {
  margin-bottom: 20px;
  padding: 15px 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 500;
  color: #606266;
}

.percentage {
  font-weight: bold;
  color: #667eea;
}

.budget-progress {
  height: 8px !important;
  margin-bottom: 10px;
}

.budget-status-text {
  font-size: 14px;
  color: #606266;
  text-align: right;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-container {
  padding: 10px 0;
}

.category-stat {
  margin-bottom: 15px;
}

.category-stat .el-statistic__title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.category-stat .el-statistic__content {
  font-size: 18px;
  font-weight: 500;
}

.daily-expense-item {
  margin-bottom: 15px;
}

.date-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.expense-bar-container {
  position: relative;
  height: 30px;
  background-color: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.expense-bar {
  height: 100%;
  background-color: #667eea;
  transition: width 0.5s ease;
}

.expense-amount {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.suggestions-card {
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
}

.suggestions-section,
.recommendation-section {
  margin-bottom: 15px;
}

.suggestions-section:last-child,
.recommendation-section:last-child {
  margin-bottom: 0;
}

.suggestions-section h3,
.recommendation-section h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 10px;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions-list li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  padding: 5px 0;
  color: #606266;
  line-height: 1.5;
}

.suggestions-list li:last-child {
  margin-bottom: 0;
}

.suggestion-icon {
  margin-right: 8px;
  color: #67c23a;
  font-size: 16px;
  flex-shrink: 0;
}

.recommendation-text {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  background-color: #fff9e6;
  border-radius: 4px;
  color: #606266;
  line-height: 1.5;
}

.recommendation-text .suggestion-icon {
  color: #e6a23c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .expense-analysis {
    padding: 10px;
  }
  
  .amount {
    font-size: 24px;
  }
  
  .chart-container {
    padding: 5px 0;
  }
}
</style>