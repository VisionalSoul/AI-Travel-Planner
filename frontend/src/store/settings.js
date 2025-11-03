import { defineStore } from 'pinia'

/**
 * 设置Store - 管理AI服务配置和用户偏好设置
 */
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // AI服务配置
    ai: {
      provider: localStorage.getItem('ai_provider') || 'aliyun-bailian', // openai, anthropic, baidu, aliyun-bailian
      apiKey: localStorage.getItem('ai_api_key') || '',
      model: localStorage.getItem('ai_model') || 'qwen-turbo',
    },
    
    // 语音识别配置
    speech: {
      provider: localStorage.getItem('speech_provider') || 'browser', // browser, iflytek, baidu
      apiKey: localStorage.getItem('speech_api_key') || '',
      secretKey: localStorage.getItem('speech_secret_key') || '',
      language: localStorage.getItem('speech_language') || 'zh-CN',
      voiceRate: parseFloat(localStorage.getItem('speech_rate') || '1.0'),
      voicePitch: parseFloat(localStorage.getItem('speech_pitch') || '1.0'),
    },
    
    // 地图服务配置
    map: {
      provider: localStorage.getItem('map_provider') || 'amap', // amap, baidu
      apiKey: localStorage.getItem('map_api_key') || '',
    },
    
    // 用户偏好设置
    preferences: {
      currency: localStorage.getItem('currency') || 'CNY',
      temperatureUnit: localStorage.getItem('temperature_unit') || 'C',
      dateFormat: localStorage.getItem('date_format') || 'YYYY-MM-DD',
      notifications: JSON.parse(localStorage.getItem('notifications') || 'true'),
      darkMode: JSON.parse(localStorage.getItem('dark_mode') || 'false'),
    },
    
    // 旅行偏好
    travelPreferences: {
      accommodationTypes: JSON.parse(localStorage.getItem('accommodation_types') || '[]'),
      transportPreferences: JSON.parse(localStorage.getItem('transport_preferences') || '[]'),
      activityTypes: JSON.parse(localStorage.getItem('activity_types') || '[]'),
      dietaryRestrictions: JSON.parse(localStorage.getItem('dietary_restrictions') || '[]'),
      interests: JSON.parse(localStorage.getItem('interests') || '[]'),
    }
  }),
  
  getters: {
    /**
     * 获取AI服务提供商
     * @returns {String} 服务提供商
     */
    getProvider: (state) => state.ai.provider,
    
    /**
     * 获取AI API密钥
     * @returns {String} API密钥
     */
    getApiKey: (state) => state.ai.apiKey,
    
    /**
     * 获取AI模型
     * @returns {String} 模型名称
     */
    getModel: (state) => state.ai.model,
    
    /**
     * 获取语音识别服务提供商
     * @returns {String} 服务提供商
     */
    getSpeechProvider: (state) => state.speech.provider,
    
    /**
     * 获取语音识别API密钥
     * @returns {String} API密钥
     */
    getSpeechApiKey: (state) => state.speech.apiKey,
    
    /**
     * 获取语音识别密钥
     * @returns {String} 密钥
     */
    getSpeechSecretKey: (state) => state.speech.secretKey,
    
    /**
     * 获取地图服务提供商
     * @returns {String} 服务提供商
     */
    getMapProvider: (state) => state.map.provider,
    
    /**
     * 获取地图API密钥
     * @returns {String} API密钥
     */
    getMapApiKey: (state) => state.map.apiKey,
    
    /**
     * 获取用户旅行偏好
     * @returns {Object} 旅行偏好对象
     */
    getTravelPreferences: (state) => state.travelPreferences,
    
    /**
     * 检查是否启用深色模式
     * @returns {Boolean} 是否启用
     */
    isDarkMode: (state) => state.preferences.darkMode,
    
    /**
     * 获取所有API密钥配置状态
     * @returns {Object} 密钥状态
     */
    apiKeyStatus: (state) => ({
      ai: !!state.ai.apiKey,
      speech: !!state.speech.apiKey,
      map: !!state.map.apiKey,
    }),
  },
  
  actions: {
    /**
     * 设置AI服务提供商
     * @param {String} provider - 服务提供商
     */
    setProvider(provider) {
      this.ai.provider = provider
      localStorage.setItem('ai_provider', provider)
      
      // 根据提供商设置默认模型
      if (provider === 'openai') {
        this.setModel('gpt-4')
      } else if (provider === 'anthropic') {
        this.setModel('claude-3-opus-20240229')
      } else if (provider === 'baidu') {
        this.setModel('ERNIE-Bot-4')
      } else if (provider === 'aliyun-bailian') {
        this.setModel('qwen-turbo')
      }
    },
    
    /**
     * 设置AI API密钥
     * @param {String} apiKey - API密钥
     */
    setApiKey(apiKey) {
      this.ai.apiKey = apiKey
      localStorage.setItem('ai_api_key', apiKey)
    },
    
    /**
     * 设置AI模型
     * @param {String} model - 模型名称
     */
    setModel(model) {
      this.ai.model = model
      localStorage.setItem('ai_model', model)
    },
    
    /**
     * 设置语音识别服务提供商
     * @param {String} provider - 服务提供商
     */
    setSpeechProvider(provider) {
      this.speech.provider = provider
      localStorage.setItem('speech_provider', provider)
    },
    
    /**
     * 设置语音识别API密钥
     * @param {String} apiKey - API密钥
     */
    setSpeechApiKey(apiKey) {
      this.speech.apiKey = apiKey
      localStorage.setItem('speech_api_key', apiKey)
    },
    
    /**
     * 设置语音识别密钥
     * @param {String} secretKey - 密钥
     */
    setSpeechSecretKey(secretKey) {
      this.speech.secretKey = secretKey
      localStorage.setItem('speech_secret_key', secretKey)
    },
    
    /**
     * 设置语音语言
     * @param {String} language - 语言代码
     */
    setSpeechLanguage(language) {
      this.speech.language = language
      localStorage.setItem('speech_language', language)
    },
    
    /**
     * 设置语音速率
     * @param {Number} rate - 速率 (0.5-2.0)
     */
    setSpeechRate(rate) {
      // 限制在有效范围内
      const validRate = Math.max(0.5, Math.min(2.0, rate))
      this.speech.voiceRate = validRate
      localStorage.setItem('speech_rate', validRate.toString())
    },
    
    /**
     * 设置语音音调
     * @param {Number} pitch - 音调 (0.5-2.0)
     */
    setSpeechPitch(pitch) {
      // 限制在有效范围内
      const validPitch = Math.max(0.5, Math.min(2.0, pitch))
      this.speech.voicePitch = validPitch
      localStorage.setItem('speech_pitch', validPitch.toString())
    },
    
    /**
     * 设置地图服务提供商
     * @param {String} provider - 服务提供商
     */
    setMapProvider(provider) {
      this.map.provider = provider
      localStorage.setItem('map_provider', provider)
    },
    
    /**
     * 设置地图API密钥
     * @param {String} apiKey - API密钥
     */
    setMapApiKey(apiKey) {
      this.map.apiKey = apiKey
      localStorage.setItem('map_api_key', apiKey)
    },
    
    /**
     * 更新用户旅行偏好
     * @param {Object} preferences - 旅行偏好对象
     */
    updateTravelPreferences(preferences) {
      this.travelPreferences = { ...this.travelPreferences, ...preferences }
      
      // 更新本地存储
      Object.keys(preferences).forEach(key => {
        if (this.travelPreferences.hasOwnProperty(key)) {
          localStorage.setItem(
            `travel_${key}`, 
            JSON.stringify(this.travelPreferences[key])
          )
        }
      })
    },
    
    /**
     * 设置深色模式
     * @param {Boolean} enabled - 是否启用
     */
    setDarkMode(enabled) {
      this.preferences.darkMode = enabled
      localStorage.setItem('dark_mode', enabled.toString())
      
      // 应用深色模式到文档
      if (enabled) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    
    /**
     * 设置通知偏好
     * @param {Boolean} enabled - 是否启用
     */
    setNotifications(enabled) {
      this.preferences.notifications = enabled
      localStorage.setItem('notifications', enabled.toString())
    },
    
    /**
     * 重置所有设置
     */
    resetSettings() {
      // 清除AI设置
      this.ai.provider = 'aliyun-bailian'
      this.ai.apiKey = ''
      this.ai.model = 'qwen-turbo'
      
      // 清除语音设置
      this.speech.provider = 'browser'
      this.speech.apiKey = ''
      this.speech.secretKey = ''
      this.speech.language = 'zh-CN'
      this.speech.voiceRate = 1.0
      this.speech.voicePitch = 1.0
      
      // 清除地图设置
      this.map.provider = 'amap'
      this.map.apiKey = ''
      
      // 清除用户偏好
      this.preferences.currency = 'CNY'
      this.preferences.temperatureUnit = 'C'
      this.preferences.dateFormat = 'YYYY-MM-DD'
      this.preferences.notifications = true
      this.preferences.darkMode = false
      
      // 清除旅行偏好
      this.travelPreferences = {
        accommodationTypes: [],
        transportPreferences: [],
        activityTypes: [],
        dietaryRestrictions: [],
        interests: [],
      }
      
      // 清除本地存储
      const keys = [
        'ai_provider', 'ai_api_key', 'ai_model',
        'speech_provider', 'speech_api_key', 'speech_secret_key', 'speech_language', 'speech_rate', 'speech_pitch',
        'map_provider', 'map_api_key',
        'currency', 'temperature_unit', 'date_format', 'notifications', 'dark_mode',
        'accommodation_types', 'transport_preferences', 'activity_types', 'dietary_restrictions', 'interests'
      ]
      
      keys.forEach(key => {
        localStorage.removeItem(key)
      })
      
      // 移除深色模式类
      document.documentElement.classList.remove('dark')
    },
    
    /**
     * 验证AI API密钥格式
     * @param {String} apiKey - 要验证的API密钥
     * @param {String} provider - 服务提供商
     * @returns {Boolean} 是否有效
     */
    validateApiKey(apiKey, provider) {
      if (!apiKey) return false
      
      // 简单的格式验证，实际应用中可能需要更严格的验证
      switch (provider) {
        case 'openai':
          // OpenAI API密钥格式通常以'sk-'开头
          return /^sk-/.test(apiKey)
        case 'anthropic':
          // Anthropic API密钥格式通常以'sk-ant-':
          return /^sk-ant-/.test(apiKey)
        case 'baidu':
          // 百度API密钥通常是32位字符串
          return apiKey.length >= 16
        case 'aliyun-bailian':
          // 阿里云百炼API密钥格式验证
          return apiKey.length >= 16
        default:
          return apiKey.length > 0
      }
    },
    
    /**
     * 导出设置为JSON
     * @returns {String} JSON格式的设置
     */
    exportSettings() {
      // 创建不含敏感信息的设置副本
      const exportData = {
        ai: {
          provider: this.ai.provider,
          model: this.ai.model,
        },
        speech: {
          provider: this.speech.provider,
          language: this.speech.language,
          voiceRate: this.speech.voiceRate,
          voicePitch: this.speech.voicePitch,
        },
        map: {
          provider: this.map.provider,
        },
        preferences: this.preferences,
        travelPreferences: this.travelPreferences,
      }
      
      return JSON.stringify(exportData, null, 2)
    },
    
    /**
     * 从JSON导入设置
     * @param {String} jsonSettings - JSON格式的设置
     * @returns {Boolean} 是否导入成功
     */
    importSettings(jsonSettings) {
      try {
        const settings = JSON.parse(jsonSettings)
        
        // 导入AI设置（不包含API密钥）
        if (settings.ai) {
          this.setProvider(settings.ai.provider)
          this.setModel(settings.ai.model)
        }
        
        // 导入语音设置（不包含API密钥）
        if (settings.speech) {
          this.setSpeechProvider(settings.speech.provider)
          this.setSpeechLanguage(settings.speech.language)
          this.setSpeechRate(settings.speech.voiceRate)
          this.setSpeechPitch(settings.speech.voicePitch)
        }
        
        // 导入地图设置（不包含API密钥）
        if (settings.map) {
          this.setMapProvider(settings.map.provider)
        }
        
        // 导入用户偏好
        if (settings.preferences) {
          this.preferences = { ...this.preferences, ...settings.preferences }
          // 应用深色模式
          this.setDarkMode(this.preferences.darkMode)
          this.setNotifications(this.preferences.notifications)
        }
        
        // 导入旅行偏好
        if (settings.travelPreferences) {
          this.updateTravelPreferences(settings.travelPreferences)
        }
        
        return true
      } catch (error) {
        console.error('导入设置失败:', error)
        return false
      }
    },
  },
})

// 导出store实例，便于直接使用
export const settingsStore = useSettingsStore()