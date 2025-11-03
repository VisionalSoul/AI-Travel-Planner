import { defineStore } from 'pinia'
import { expenseAPI } from '../services/api'
import { ElMessage } from 'element-plus'

export const useExpensesStore = defineStore('expenses', {
  state: () => ({
    expenses: [],
    currentTripExpenses: [],
    budget: 0,
    loading: false,
    error: null,
    budgetAnalysis: null
  }),

  getters: {
    // 计算总支出
    totalExpenses: (state) => {
      return state.currentTripExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
    },

    // 计算剩余预算
    remainingBudget: (state) => {
      return state.budget - state.totalExpenses
    },

    // 计算预算使用百分比
    budgetUsagePercentage: (state) => {
      if (!state.budget) return 0
      return Math.round((state.totalExpenses / state.budget) * 100)
    },

    // 按分类统计费用
    expensesByCategory: (state) => {
      const categories = {}
      state.currentTripExpenses.forEach(expense => {
        const category = expense.category || '其他'
        if (!categories[category]) {
          categories[category] = 0
        }
        categories[category] += expense.amount || 0
      })
      return categories
    },

    // 获取预算状态
    budgetStatus: (state) => {
      const percentage = state.budgetUsagePercentage
      if (percentage >= 90) return 'over_budget'
      if (percentage >= 70) return 'on_track'
      return 'under_budget'
    },

    // 按日期获取费用趋势
    dailyExpenses: (state) => {
      const daily = {}
      state.currentTripExpenses.forEach(expense => {
        const date = expense.date
        if (!daily[date]) {
          daily[date] = 0
        }
        daily[date] += expense.amount || 0
      })
      // 转换为数组并排序
      return Object.entries(daily)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    }
  },

  actions: {
    // 获取行程费用
    async fetchExpensesByTripId(tripId) {
      this.loading = true
      this.error = null
      
      try {
        const response = await expenseAPI.getByTripId(tripId)
        if (response.success) {
          this.currentTripExpenses = response.data
          return response.data
        } else {
          throw new Error(response.message || '获取费用记录失败')
        }
      } catch (error) {
        console.error('获取费用记录失败:', error)
        this.error = error.message || '获取费用记录失败，请重试'
        // 返回空数组作为降级方案
        this.currentTripExpenses = []
        return []
      } finally {
        this.loading = false
      }
    },

    // 添加费用记录
    async addExpense(tripId, expenseData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await expenseAPI.create({
          tripId,
          ...expenseData
        })
        
        if (response.success) {
          this.currentTripExpenses.push(response.data)
          ElMessage.success('费用记录添加成功')
          return response.data
        } else {
          throw new Error(response.message || '添加费用记录失败')
        }
      } catch (error) {
        console.error('添加费用记录失败:', error)
        this.error = error.message || '添加费用记录失败，请重试'
        // 降级方案：本地添加记录
        const newExpense = {
          _id: Date.now().toString(),
          tripId,
          ...expenseData,
          createdAt: new Date().toISOString()
        }
        this.currentTripExpenses.push(newExpense)
        ElMessage.warning('使用离线模式添加费用记录，请稍后同步')
        return newExpense
      } finally {
        this.loading = false
      }
    },

    // 更新费用记录
    async updateExpense(expenseId, expenseData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await expenseAPI.update(expenseId, expenseData)
        
        if (response.success) {
          const index = this.currentTripExpenses.findIndex(e => e._id === expenseId)
          if (index !== -1) {
            this.currentTripExpenses[index] = { ...this.currentTripExpenses[index], ...expenseData }
          }
          ElMessage.success('费用记录更新成功')
          return true
        } else {
          throw new Error(response.message || '更新费用记录失败')
        }
      } catch (error) {
        console.error('更新费用记录失败:', error)
        this.error = error.message || '更新费用记录失败，请重试'
        // 降级方案：本地更新记录
        const index = this.currentTripExpenses.findIndex(e => e._id === expenseId)
        if (index !== -1) {
          this.currentTripExpenses[index] = { ...this.currentTripExpenses[index], ...expenseData }
          ElMessage.warning('使用离线模式更新费用记录，请稍后同步')
          return true
        }
        return false
      } finally {
        this.loading = false
      }
    },

    // 删除费用记录
    async deleteExpense(expenseId) {
      this.loading = true
      this.error = null
      
      try {
        const response = await expenseAPI.delete(expenseId)
        
        if (response.success) {
          this.currentTripExpenses = this.currentTripExpenses.filter(e => e._id !== expenseId)
          ElMessage.success('费用记录删除成功')
          return true
        } else {
          throw new Error(response.message || '删除费用记录失败')
        }
      } catch (error) {
        console.error('删除费用记录失败:', error)
        this.error = error.message || '删除费用记录失败，请重试'
        // 降级方案：本地删除记录
        this.currentTripExpenses = this.currentTripExpenses.filter(e => e._id !== expenseId)
        ElMessage.warning('使用离线模式删除费用记录，请稍后同步')
        return true
      } finally {
        this.loading = false
      }
    },

    // 设置预算
    setBudget(amount) {
      this.budget = amount
    },

    // 清除当前行程费用
    clearCurrentExpenses() {
      this.currentTripExpenses = []
      this.budget = 0
      this.budgetAnalysis = null
    },

    // 获取费用统计数据（用于图表显示）
    getExpenseStatistics() {
      const categories = this.expensesByCategory
      const data = Object.entries(categories).map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: Math.round((amount / this.totalExpenses) * 100)
      }))
      
      return {
        total: this.totalExpenses,
        categories: data,
        dailyTrend: this.dailyExpenses,
        budgetStatus: this.budgetStatus
      }
    },

    // 应用预算分析结果
    applyBudgetAnalysis(analysis) {
      this.budgetAnalysis = analysis
    }
  }
})