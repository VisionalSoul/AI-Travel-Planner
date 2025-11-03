import { defineStore } from 'pinia'
import { tripService } from '../services/apiService'

export const useTripsStore = defineStore('trips', {
  state: () => ({
    trips: [],
    currentTrip: null,
    loading: false,
    error: null
  }),

  getters: {
    allTrips: (state) => state.trips,
    hasTrips: (state) => state.trips.length > 0,
    getTripById: (state) => (id) => {
      return state.trips.find(trip => trip._id === id) || state.currentTrip
    }
  },

  actions: {
    // 获取所有行程
    async fetchTrips() {
      this.loading = true
      this.error = null
      
      try {
        const response = await tripService.getAllTrips()
        
        if (response.success) {
          this.trips = response.data
          return response.data
        } else {
          throw new Error(response.message || '获取行程失败')
        }
      } catch (error) {
        this.error = error.message || '获取行程失败，请重试'
        return []
      } finally {
        this.loading = false
      }
    },

    // 获取单个行程
    async fetchTrip(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await tripService.getTrip(id)
        
        if (response.success) {
          this.currentTrip = response.data
          return response.data
        } else {
          throw new Error(response.message || '获取行程详情失败')
        }
      } catch (error) {
        this.error = error.message || '获取行程详情失败，请重试'
        return null
      } finally {
        this.loading = false
      }
    },

    // 创建行程
    async createTrip(tripData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await tripService.createTrip(tripData)
        
        if (response.success) {
          this.trips.unshift(response.data) // 添加到列表开头
          return response.data
        } else {
          throw new Error(response.message || '创建行程失败')
        }
      } catch (error) {
        this.error = error.message || '创建行程失败，请重试'
        return null
      } finally {
        this.loading = false
      }
    },

    // 更新行程
    async updateTrip(id, tripData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await tripService.updateTrip(id, tripData)
        
        if (response.success) {
          // 更新本地行程列表
          const index = this.trips.findIndex(trip => trip._id === id)
          if (index !== -1) {
            this.trips[index] = response.data
          }
          
          // 更新当前行程
          if (this.currentTrip && this.currentTrip._id === id) {
            this.currentTrip = response.data
          }
          
          return response.data
        } else {
          throw new Error(response.message || '更新行程失败')
        }
      } catch (error) {
        this.error = error.message || '更新行程失败，请重试'
        return null
      } finally {
        this.loading = false
      }
    },

    // 删除行程
    async deleteTrip(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await tripService.deleteTrip(id)
        
        if (response.success) {
          // 从本地列表中移除
          this.trips = this.trips.filter(trip => trip._id !== id)
          
          // 如果删除的是当前行程，清除当前行程
          if (this.currentTrip && this.currentTrip._id === id) {
            this.currentTrip = null
          }
          
          return true
        } else {
          throw new Error(response.message || '删除行程失败')
        }
      } catch (error) {
        this.error = error.message || '删除行程失败，请重试'
        return false
      } finally {
        this.loading = false
      }
    },

    // 添加费用
    async addExpense(tripId, expenseData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await tripService.addExpense(tripId, expenseData)
        
        if (response.success) {
          // 更新本地行程数据
          const index = this.trips.findIndex(trip => trip._id === tripId)
          if (index !== -1) {
            this.trips[index] = response.data
          }
          
          // 更新当前行程
          if (this.currentTrip && this.currentTrip._id === tripId) {
            this.currentTrip = response.data
          }
          
          return true
        } else {
          throw new Error(response.message || '添加费用失败')
        }
      } catch (error) {
        this.error = error.message || '添加费用失败，请重试'
        return false
      } finally {
        this.loading = false
      }
    },

    // 添加照片
    async addPhoto(tripId, photoData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await tripService.addPhoto(tripId, photoData)
        
        if (response.success) {
          // 更新本地行程数据
          const index = this.trips.findIndex(trip => trip._id === tripId)
          if (index !== -1) {
            this.trips[index] = response.data
          }
          
          // 更新当前行程
          if (this.currentTrip && this.currentTrip._id === tripId) {
            this.currentTrip = response.data
          }
          
          return true
        } else {
          throw new Error(response.message || '添加照片失败')
        }
      } catch (error) {
        this.error = error.message || '添加照片失败，请重试'
        return false
      } finally {
        this.loading = false
      }
    },

    // 清除当前行程
    clearCurrentTrip() {
      this.currentTrip = null
    },

    // 清除错误
    clearError() {
      this.error = null
    }
  }
})