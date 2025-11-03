// 直接在模块顶部导入，但避免在非Vue组件上下文中调用
import { useSettingsStore } from '../store/settings'

/**
 * AI服务类 - 处理与大语言模型的交互，实现行程规划功能
 */
class AIService {
  constructor() {
    // 延迟初始化settings，不在构造函数中直接调用useSettingsStore
    this._settings = null
  }

  /**
   * 获取settings store实例
   * @returns {Object} settings store实例
   */
  getSettings() {
    if (!this._settings) {
      // 在Vue组件上下文内调用useSettingsStore()
      try {
        this._settings = useSettingsStore()
      } catch (error) {
        console.error('无法获取settings store，请确保在Vue组件上下文中使用此服务:', error)
        // 创建一个默认的mock对象避免应用崩溃
        this._settings = {
          getProvider: 'openai',
          getApiKey: '',
          getModel: 'gpt-3.5-turbo'
        }
      }
    }
    return this._settings
  }

  /**
   * 更新配置
   */
  updateSettings() {
    this._settings = null // 清除缓存，下次使用时重新获取
  }

  /**
   * 获取AI服务的请求头
   * @returns {Object} 请求头对象
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    // 根据不同的服务提供商添加相应的API密钥
    const provider = this.getSettings().getProvider
    const apiKey = this.getSettings().getApiKey
    
    if (apiKey) {
      if (provider === 'openai') {
        headers['Authorization'] = `Bearer ${apiKey}`
      } else if (provider === 'anthropic') {
        headers['x-api-key'] = apiKey
        headers['anthropic-version'] = '2023-06-01'
      } else if (provider === 'baidu') {
        // 百度文心一言API的认证可能需要其他方式
        // 这里简化处理
      }
    }
    
    return headers
  }

  /**
   * 生成行程规划提示词
   * @param {Object} tripData - 行程数据
   * @returns {String} 格式化的提示词
   */
  generateTripPrompt(tripData) {
    const {
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      preferences,
      notes
    } = tripData
    
    // 计算行程天数
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
    
    let prompt = `请为我规划一次前往${destination}的旅行行程。\n\n`
    prompt += `**旅行详情**\n`
    prompt += `- 日期：${startDate} 至 ${endDate}（共${days}天）\n`
    prompt += `- 预算：${budget}元\n`
    prompt += `- 人数：${travelers || 1}人\n`
    
    if (preferences && preferences.length > 0) {
      prompt += `- 旅行偏好：${preferences.join('、')}\n`
    }
    
    if (notes) {
      prompt += `- 其他要求：${notes}\n`
    }
    
    prompt += `\n**详细要求**\n`
    prompt += `1. 请为每天提供详细的行程安排，包括上午、下午和晚上的活动。\n`
    prompt += `2. 行程安排应考虑合理的时间分配和地理位置的连贯性。\n`
    prompt += `3. 推荐当地特色景点、餐厅和体验活动。\n`
    prompt += `4. 估算每天的费用支出，包括交通、餐饮、门票等。\n`
    prompt += `5. 提供一些实用的旅行建议和当地注意事项。\n`
    prompt += `6. 考虑我的旅行偏好进行个性化推荐。\n`
    prompt += `\n请以JSON格式返回行程规划结果，格式如下：\n`
    prompt += `{\n`
    prompt += `  "title": "[行程标题]",\n`
    prompt += `  "description": "[行程描述]",\n`
    prompt += `  "itinerary": [\n`
    prompt += `    {\n`
    prompt += `      "day": 1,\n`
    prompt += `      "date": "YYYY-MM-DD",\n`
    prompt += `      "activities": [\n`
    prompt += `        {\n`
    prompt += `          "time": "09:00",\n`
    prompt += `          "title": "[活动名称]",\n`
    prompt += `          "location": "[地点]",\n`
    prompt += `          "description": "[活动描述]",\n`
    prompt += `          "cost": 100,\n`
    prompt += `          "category": "[分类：景点/餐饮/交通/住宿/其他]"\n`
    prompt += `        }\n`
    prompt += `      ],\n`
    prompt += `      "dailyBudget": 500\n`
    prompt += `    }\n`
    prompt += `  ],\n`
    prompt += `  "totalBudget": 2500,\n`
    prompt += `  "suggestions": ["[建议1]", "[建议2]"]\n`
    prompt += `}\n`
    
    return prompt
  }

  /**
   * 生成预算分析提示词
   * @param {Object} tripData - 行程数据
   * @param {Array} expenses - 费用记录数组
   * @returns {String} 格式化的提示词
   */
  generateBudgetPrompt(tripData, expenses) {
    const {
      destination,
      startDate,
      endDate,
      budget
    } = tripData
    
    let prompt = `请对我在${destination}的旅行费用进行分析。\n\n`
    prompt += `**旅行信息**\n`
    prompt += `- 日期：${startDate} 至 ${endDate}\n`
    prompt += `- 总预算：${budget}元\n`
    
    if (expenses && expenses.length > 0) {
      prompt += `\n**费用记录**\n`
      expenses.forEach(expense => {
        prompt += `- ${expense.date}: ${expense.category} - ${expense.description} (${expense.amount}元)\n`
      })
    }
    
    prompt += `\n请提供以下分析：\n`
    prompt += `1. 费用分类统计和占比分析\n`
    prompt += `2. 与预算的对比分析\n`
    prompt += `3. 节省费用的建议\n`
    prompt += `4. 后续行程的预算调整建议\n`
    
    prompt += `\n请以JSON格式返回分析结果，格式如下：\n`
    prompt += `{\n`
    prompt += `  "totalSpent": 1200,\n`
    prompt += `  "remainingBudget": 800,\n`
    prompt += `  "percentageUsed": 60,\n`
    prompt += `  "categoryBreakdown": {\n`
    prompt += `    "transportation": { "amount": 300, "percentage": 25 },\n`
    prompt += `    "accommodation": { "amount": 400, "percentage": 33.3 },\n`
    prompt += `    "food": { "amount": 200, "percentage": 16.7 },\n`
    prompt += `    "activities": { "amount": 200, "percentage": 16.7 },\n`
    prompt += `    "shopping": { "amount": 100, "percentage": 8.3 }\n`
    prompt += `  },\n`
    prompt += `  "budgetStatus": "[状态：under_budget/on_track/over_budget]",\n`
    prompt += `  "savingSuggestions": ["[建议1]", "[建议2]"],\n`
    prompt += `  "adjustmentRecommendations": "[调整建议]"\n`
    prompt += `}\n`
    
    return prompt
  }

  /**
   * 调用AI服务生成行程规划
   * @param {Object} tripData - 行程数据
   * @returns {Promise<Object>} 行程规划结果
   */
  async generateItinerary(tripData) {
    try {
      this.updateSettings()
      const provider = this.getSettings().getProvider
      const prompt = this.generateTripPrompt(tripData)
      
      let response, result
      
      if (provider === 'openai') {
        response = await this.callOpenAI(prompt)
        result = this.parseOpenAIResponse(response)
      } else if (provider === 'anthropic') {
        response = await this.callAnthropic(prompt)
        result = this.parseAnthropicResponse(response)
      } else if (provider === 'baidu') {
        response = await this.callBaiduWenxin(prompt)
        result = this.parseBaiduResponse(response)
      } else if (provider === 'aliyun-bailian') {
        response = await this.callAliyunBailian(prompt)
        result = this.parseAliyunBailianResponse(response)
      } else {
        // 默认为模拟响应
        console.warn('未配置AI服务提供商，使用模拟数据')
        return this.getMockItinerary(tripData)
      }
      
      return result
    } catch (error) {
      console.error('生成行程规划失败:', error)
      // 如果API调用失败，返回模拟数据作为降级方案
      return this.getMockItinerary(tripData)
    }
  }

  /**
   * 调用AI服务进行预算分析
   * @param {Object} tripData - 行程数据
   * @param {Array} expenses - 费用记录数组
   * @returns {Promise<Object>} 预算分析结果
   */
  async analyzeBudget(tripData, expenses) {
    try {
      this.updateSettings()
      const provider = this.getSettings().getProvider
      const prompt = this.generateBudgetPrompt(tripData, expenses)
      
      let response, result
      
      if (provider === 'openai') {
        response = await this.callOpenAI(prompt)
        result = this.parseOpenAIResponse(response)
      } else if (provider === 'anthropic') {
        response = await this.callAnthropic(prompt)
        result = this.parseAnthropicResponse(response)
      } else if (provider === 'baidu') {
        response = await this.callBaiduWenxin(prompt)
        result = this.parseBaiduResponse(response)
      } else if (provider === 'aliyun-bailian') {
        response = await this.callAliyunBailian(prompt)
        result = this.parseAliyunBailianResponse(response)
      } else {
        // 默认为模拟响应
        console.warn('未配置AI服务提供商，使用模拟数据')
        return this.getMockBudgetAnalysis(tripData, expenses)
      }
      
      return result
    } catch (error) {
      console.error('预算分析失败:', error)
      // 如果API调用失败，返回模拟数据作为降级方案
      return this.getMockBudgetAnalysis(tripData, expenses)
    }
  }

  /**
   * 调用OpenAI API
   * @param {String} prompt - 提示词
   * @returns {Promise<Object>} API响应
   */
  async callOpenAI(prompt) {
    const apiKey = this.getSettings().getApiKey
    if (!apiKey) {
      throw new Error('未配置OpenAI API密钥')
    }
    
    const model = this.getSettings().getModel || 'gpt-4'
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的旅行规划师，擅长根据用户需求创建详细的旅行行程和预算分析。请严格按照要求的JSON格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    })
    
    if (!response.ok) {
      throw new Error(`OpenAI API错误: ${response.statusText}`)
    }
    
    return await response.json()
  }

  /**
   * 调用Anthropic API
   * @param {String} prompt - 提示词
   * @returns {Promise<Object>} API响应
   */
  async callAnthropic(prompt) {
    const apiKey = this.getSettings().getApiKey
    if (!apiKey) {
      throw new Error('未配置Anthropic API密钥')
    }
    
    const model = this.getSettings().getModel || 'claude-3-opus-20240229'
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        system: '你是一位专业的旅行规划师，擅长根据用户需求创建详细的旅行行程和预算分析。请严格按照要求的JSON格式返回结果。'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Anthropic API错误: ${response.statusText}`)
    }
    
    return await response.json()
  }

  /**
   * 调用百度文心一言API
   * @param {String} prompt - 提示词
   * @returns {Promise<Object>} API响应
   */
  async callBaiduWenxin(prompt) {
    // 百度文心一言API的调用方式可能有所不同
    // 这里是简化的实现，实际使用时需要参考百度官方文档
    throw new Error('百度文心一言API调用尚未完全实现')
  }

  /**
   * 调用阿里云百炼平台API（通过后端代理）
   * @param {String} prompt - 提示词
   * @returns {Promise<Object>} API响应
   */
  async callAliyunBailian(prompt) {
    try {
      const response = await fetch('/api/ai/generate-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: prompt,
          model: 'qwen-max'
        })
      })
      
      if (!response.ok) {
        throw new Error(`阿里云百炼API错误: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('调用阿里云百炼平台失败:', error)
      throw error
    }
  }

  /**
   * 解析OpenAI响应
   * @param {Object} response - API响应
   * @returns {Object} 解析后的结果
   */
  parseOpenAIResponse(response) {
    try {
      const content = response.choices[0].message.content
      return JSON.parse(content)
    } catch (error) {
      console.error('解析OpenAI响应失败:', error)
      throw new Error('无法解析AI响应格式')
    }
  }

  /**
   * 解析Anthropic响应
   * @param {Object} response - API响应
   * @returns {Object} 解析后的结果
   */
  parseAnthropicResponse(response) {
    try {
      const content = response.content[0].text
      return JSON.parse(content)
    } catch (error) {
      console.error('解析Anthropic响应失败:', error)
      throw new Error('无法解析AI响应格式')
    }
  }

  /**
   * 解析百度文心一言响应
   * @param {Object} response - API响应
   * @returns {Object} 解析后的结果
   */
  parseBaiduResponse(response) {
    // 根据百度文心一言的实际响应格式进行解析
    throw new Error('百度文心一言响应解析尚未实现')
  }

  /**
   * 解析阿里云百炼平台响应
   * @param {Object} response - API响应
   * @returns {Object} 解析后的结果
   */
  parseAliyunBailianResponse(response) {
    try {
      // 阿里云百炼平台的响应格式可能不同，根据实际情况调整
      const content = response.content || JSON.stringify(response)
      
      // 提取JSON内容
      const jsonMatch = content.match(/```json\n([\s\S]+?)\n```/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1])
      }
      
      // 尝试直接解析内容
      return JSON.parse(content)
    } catch (error) {
      console.error('解析阿里云百炼响应失败:', error)
      throw new Error('无法解析AI响应格式')
    }
  }

  /**
   * 获取模拟行程数据
   * @param {Object} tripData - 行程数据
   * @returns {Object} 模拟的行程规划结果
   */
  getMockItinerary(tripData) {
    const {
      destination,
      startDate,
      endDate,
      budget
    } = tripData
    
    // 计算行程天数
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
    
    const itinerary = []
    const dailyBudget = Math.round(budget / days)
    
    // 生成每天的行程
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(start)
      currentDate.setDate(start.getDate() + i)
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // 根据天数生成不同的活动
      let activities = []
      
      if (i === 0) {
        // 第一天
        activities = [
          {
            time: "09:00",
            title: "抵达目的地",
            location: `${destination}机场/车站`,
            description: "抵达并办理入境手续",
            cost: 0,
            category: "交通"
          },
          {
            time: "11:00",
            title: "入住酒店",
            location: "市中心酒店",
            description: "办理入住并稍作休息",
            cost: Math.round(dailyBudget * 0.4),
            category: "住宿"
          },
          {
            time: "14:00",
            title: "城市概览",
            location: "市中心",
            description: "漫步城市中心，熟悉环境",
            cost: Math.round(dailyBudget * 0.1),
            category: "其他"
          },
          {
            time: "18:00",
            title: "欢迎晚餐",
            location: "当地餐厅",
            description: "品尝当地特色美食",
            cost: Math.round(dailyBudget * 0.2),
            category: "餐饮"
          }
        ]
      } else if (i === days - 1) {
        // 最后一天
        activities = [
          {
            time: "09:00",
            title: "自由活动",
            location: "购物区",
            description: "自由购物，购买纪念品",
            cost: Math.round(dailyBudget * 0.3),
            category: "其他"
          },
          {
            time: "12:00",
            title: "告别午餐",
            location: "特色餐厅",
            description: "享用最后一顿当地美食",
            cost: Math.round(dailyBudget * 0.2),
            category: "餐饮"
          },
          {
            time: "14:00",
            title: "退房",
            location: "酒店",
            description: "办理退房手续",
            cost: 0,
            category: "住宿"
          },
          {
            time: "17:00",
            title: "前往机场/车站",
            location: `${destination}机场/车站`,
            description: "搭乘返程交通",
            cost: Math.round(dailyBudget * 0.3),
            category: "交通"
          }
        ]
      } else {
        // 中间天数
        activities = [
          {
            time: "08:30",
            title: "早餐",
            location: "酒店或当地餐厅",
            description: "享用丰盛早餐，准备一天行程",
            cost: Math.round(dailyBudget * 0.1),
            category: "餐饮"
          },
          {
            time: "10:00",
            title: `${destination}主要景点游览`,
            location: `${destination}标志性景点`,
            description: `参观${destination}著名景点`,
            cost: Math.round(dailyBudget * 0.25),
            category: "景点"
          },
          {
            time: "13:00",
            title: "午餐",
            location: "景区附近餐厅",
            description: "在景点附近用餐",
            cost: Math.round(dailyBudget * 0.15),
            category: "餐饮"
          },
          {
            time: "15:00",
            title: "文化体验活动",
            location: "当地文化区",
            description: "体验当地文化和生活方式",
            cost: Math.round(dailyBudget * 0.2),
            category: "其他"
          },
          {
            time: "18:00",
            title: "晚餐",
            location: "当地特色餐厅",
            description: "品尝更多当地美食",
            cost: Math.round(dailyBudget * 0.2),
            category: "餐饮"
          }
        ]
      }
      
      itinerary.push({
        day: i + 1,
        date: dateStr,
        activities,
        dailyBudget
      })
    }
    
    return {
      title: `${destination}${days}天深度游`,
      description: `这是一份${destination}的${days}天详细旅行计划，涵盖了当地主要景点、美食和文化体验，总预算${budget}元。`,
      itinerary,
      totalBudget: budget,
      suggestions: [
        "建议提前预订热门景点门票以避免排队",
        "尝试使用当地公共交通，既经济又能体验当地生活",
        "随身携带转换插头和充电宝",
        "注意当地天气变化，做好相应准备"
      ]
    }
  }

  /**
   * 获取模拟预算分析数据
   * @param {Object} tripData - 行程数据
   * @param {Array} expenses - 费用记录数组
   * @returns {Object} 模拟的预算分析结果
   */
  getMockBudgetAnalysis(tripData, expenses = []) {
    const { budget } = tripData
    
    // 计算总支出
    let totalSpent = 0
    const categoryTotals = {
      transportation: 0,
      accommodation: 0,
      food: 0,
      activities: 0,
      shopping: 0,
      other: 0
    }
    
    if (expenses.length > 0) {
      expenses.forEach(expense => {
        const amount = expense.amount || 0
        totalSpent += amount
        
        if (categoryTotals.hasOwnProperty(expense.category)) {
          categoryTotals[expense.category] += amount
        } else {
          categoryTotals.other += amount
        }
      })
    } else {
      // 如果没有费用记录，生成模拟数据
      totalSpent = Math.round(budget * 0.6)
      categoryTotals.transportation = Math.round(totalSpent * 0.25)
      categoryTotals.accommodation = Math.round(totalSpent * 0.35)
      categoryTotals.food = Math.round(totalSpent * 0.2)
      categoryTotals.activities = Math.round(totalSpent * 0.15)
      categoryTotals.shopping = Math.round(totalSpent * 0.05)
    }
    
    const remainingBudget = budget - totalSpent
    const percentageUsed = Math.round((totalSpent / budget) * 100)
    
    // 确定预算状态
    let budgetStatus = 'under_budget'
    if (percentageUsed >= 90) {
      budgetStatus = 'over_budget'
    } else if (percentageUsed >= 70) {
      budgetStatus = 'on_track'
    }
    
    // 构建分类明细
    const categoryBreakdown = {}
    Object.keys(categoryTotals).forEach(category => {
      if (categoryTotals[category] > 0) {
        categoryBreakdown[category] = {
          amount: categoryTotals[category],
          percentage: parseFloat(((categoryTotals[category] / totalSpent) * 100).toFixed(1))
        }
      }
    })
    
    return {
      totalSpent,
      remainingBudget,
      percentageUsed,
      categoryBreakdown,
      budgetStatus,
      savingSuggestions: [
        "考虑使用公共交通代替出租车以节省交通费用",
        "在当地市场或便利店购买零食和饮料，避免景区高价消费",
        "午餐可以选择平价餐厅，晚餐再体验特色美食",
        "关注当地优惠活动和套票，节省景点门票费用"
      ],
      adjustmentRecommendations: percentageUsed > 80 
        ? "建议适当减少购物和非必要活动，以避免超出预算"
        : "预算使用合理，可以适当增加一些特色体验活动"
    }
  }

  /**
   * 获取AI回答的通用方法
   * @param {String} prompt - 提示词
   * @param {Object} options - 选项
   * @returns {Promise<String>} AI回答
   */
  async getAIResponse(prompt, options = {}) {
    try {
      this.updateSettings()
      const provider = this.getSettings().getProvider
      
      let response, content
      
      if (provider === 'openai') {
        response = await this.callOpenAI(prompt)
        content = response.choices[0].message.content
      } else if (provider === 'anthropic') {
        response = await this.callAnthropic(prompt)
        content = response.content[0].text
      } else if (provider === 'aliyun-bailian') {
        response = await this.callAliyunBailian(prompt)
        content = response.content || JSON.stringify(response)
      } else {
        // 返回模拟回答
        return "这是一个模拟的AI回答。在实际应用中，这里将返回来自大语言模型的真实回答。"
      }
      
      return content
    } catch (error) {
      console.error('获取AI回答失败:', error)
      return "抱歉，AI服务暂时不可用，请稍后再试。"
    }
  }
}

// 导出单例实例
export const aiService = new AIService()

// 导出服务类，便于测试
export { AIService }