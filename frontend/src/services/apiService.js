import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除token并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // 返回错误信息
    return Promise.reject(error.response ? error.response.data : error);
  }
);

// SHA-256哈希函数
const sha256 = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// 认证相关API
export const authService = {
  // 用户注册
  register: async (userData) => {
    console.log('前端传递的注册数据:', userData);
    // 复制用户数据，避免直接修改原始数据
    const userDataWithHashedPassword = { ...userData };
    // 对密码进行SHA-256哈希处理
    try {
      userDataWithHashedPassword.password = await sha256(userData.password);
      console.log('哈希后的密码存在:', !!userDataWithHashedPassword.password);
    } catch (error) {
      console.error('密码哈希出错:', error);
    }
    console.log('发送到后端的数据:', userDataWithHashedPassword);
    return await api.post('/auth/register', userDataWithHashedPassword);
  },
  
  // 用户登录
  login: async (credentials) => {
    // 复制凭据，避免直接修改原始数据
    const credentialsWithHashedPassword = { ...credentials };
    // 对密码进行SHA-256哈希处理
    credentialsWithHashedPassword.password = await sha256(credentials.password);
    return await api.post('/auth/login', credentialsWithHashedPassword);
  },
  
  // 获取当前用户信息
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  }
};

// 行程相关API
export const tripService = {
  // 获取所有行程
  getAllTrips: async () => {
    return await api.get('/trips');
  },
  
  // 获取单个行程
  getTrip: async (id) => {
    return await api.get(`/trips/${id}`);
  },
  
  // 创建行程
  createTrip: async (tripData) => {
    return await api.post('/trips', tripData);
  },
  
  // 更新行程
  updateTrip: async (id, tripData) => {
    return await api.put(`/trips/${id}`, tripData);
  },
  
  // 删除行程
  deleteTrip: async (id) => {
    return await api.delete(`/trips/${id}`);
  },
  
  // 添加费用
  addExpense: async (tripId, expenseData) => {
    return await api.post(`/trips/${tripId}/expenses`, expenseData);
  },
  
  // 添加照片
  addPhoto: async (tripId, photoData) => {
    return await api.post(`/trips/${tripId}/photos`, photoData);
  }
};

// 健康检查API
export const healthService = {
  check: async () => {
    return await api.get('/health');
  }
};

export default api;