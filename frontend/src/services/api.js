import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api', // 使用相对路径，通过nginx反向代理
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器，添加认证token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器，处理常见错误
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转登录
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          console.error('没有权限访问该资源')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error(`请求失败: ${error.response.data.message || '未知错误'}`)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查您的网络连接')
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  }
)

// 用户相关API
export const userAPI = {
  // 用户注册
  register: async (userData) => {
    return api.post('/auth/register', userData)
  },
  // 用户登录
  login: async (credentials) => {
    return api.post('/auth/login', credentials)
  },
  // 获取用户信息
  getProfile: async () => {
    return api.get('/auth/profile')
  },
  // 更新用户信息
  updateProfile: async (userData) => {
    return api.put('/auth/profile', userData)
  }
}

// 行程相关API
export const tripAPI = {
  // 创建行程
  create: async (tripData) => {
    return api.post('/trips', tripData)
  },
  // 获取用户所有行程
  getAll: async () => {
    return api.get('/trips')
  },
  // 获取单个行程详情
  getById: async (tripId) => {
    return api.get(`/trips/${tripId}`)
  },
  // 更新行程
  update: async (tripId, tripData) => {
    return api.put(`/trips/${tripId}`, tripData)
  },
  // 删除行程
  delete: async (tripId) => {
    return api.delete(`/trips/${tripId}`)
  }
}

// AI行程规划API
export const aiAPI = {
  // 生成AI行程规划
  generatePlan: async (tripRequirements) => {
    return api.post('/ai/plan', tripRequirements)
  },
  // 预算分析
  analyzeBudget: async (tripData) => {
    return api.post('/ai/analyze-budget', tripData)
  }
}

// 费用管理API
export const expenseAPI = {
  // 记录费用
  create: async (expenseData) => {
    return api.post('/expenses', expenseData)
  },
  // 获取行程所有费用
  getByTripId: async (tripId) => {
    return api.get(`/expenses/${tripId}`)
  },
  // 更新费用记录
  update: async (expenseId, expenseData) => {
    return api.put(`/expenses/${expenseId}`, expenseData)
  },
  // 删除费用记录
  delete: async (expenseId) => {
    return api.delete(`/expenses/${expenseId}`)
  }
}

// 语音识别服务
export const speechAPI = {
  // 上传语音文件进行识别
  recognizeSpeech: async (audioBlob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob)
    return api.post('/speech/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default api