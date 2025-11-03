const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

class AliyunBailianService {
  constructor() {
    this.appKey = process.env.ALIYUN_BAILIAN_APPKEY;
    this.appSecret = process.env.ALIYUN_BAILIAN_APPSECRET;
    this.endpoint = process.env.ALIYUN_BAILIAN_ENDPOINT || 'https://bailian.aliyuncs.com';
    this.apiVersion = process.env.ALIYUN_BAILIAN_API_VERSION || '2024-01-01';
  }

  /**
   * 生成阿里云API请求签名
   */
  generateSignature(params) {
    // 按字母顺序排序参数
    const sortedParams = Object.keys(params).sort().map(key => `${key}${params[key]}`).join('');
    
    // 拼接字符串并计算签名
    const stringToSign = `${this.appKey}${sortedParams}${this.appSecret}`;
    return crypto.createHash('md5').update(stringToSign).digest('hex').toUpperCase();
  }

  /**
   * 生成旅行计划
   */
  async generateTravelPlan(prompt) {
    try {
      const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
      
      const params = {
        Action: 'Chat',
        Version: this.apiVersion,
        AppKey: this.appKey,
        Timestamp: timestamp,
        Format: 'JSON',
        Content: prompt,
        Model: 'qwen-max'
      };

      params.Signature = this.generateSignature(params);

      const response = await axios.post(this.endpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      console.error('阿里云百炼平台调用失败:', error.message);
      throw new Error('生成旅行计划失败，请检查API配置');
    }
  }

  /**
   * 处理用户的旅行相关问题
   */
  async handleTravelQuery(query, context = '') {
    const prompt = context 
      ? `${context}\n\n用户新问题: ${query}`
      : `请作为旅行顾问回答以下问题:\n${query}`;

    return this.generateTravelPlan(prompt);
  }

  /**
   * 分析旅行偏好并推荐目的地
   */
  async recommendDestinations(preferences) {
    const prompt = `基于以下旅行偏好，推荐3-5个适合的旅游目的地，并简要说明推荐理由：\n` +
      `- 旅行类型: ${preferences.travelType?.join(', ') || '不限'}\n` +
      `- 预算范围: ${preferences.budget || '不限'}\n` +
      `- 时长: ${preferences.duration || '不限'}\n` +
      `- 季节: ${preferences.season || '不限'}\n` +
      `- 兴趣点: ${preferences.interests?.join(', ') || '无特殊兴趣'}\n` +
      `- 其他偏好: ${preferences.other || '无'}`;

    return this.generateTravelPlan(prompt);
  }
}

module.exports = new AliyunBailianService();