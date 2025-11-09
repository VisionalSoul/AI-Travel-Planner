const express = require('express');
const router = express.Router();
const AliyunBailianService = require('../services/aliyunBailianService');
// 创建服务实例
const aliyunBailianService = new AliyunBailianService();
const { protect } = require('../middleware/auth');

// 注意：generate-trip路由不需要用户认证，因为它使用API密钥认证

/**
 * 生成旅行计划
 * POST /api/ai/generate-trip
 */
router.post('/generate-trip', async (req, res) => {
  try {
    const { content, model } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: '内容不能为空' });
    }
    
    // 从请求头中获取API密钥
    const authHeader = req.headers.authorization;
    let apiKey = null;
    
    console.log('收到generate-trip请求，Authorization头:', authHeader ? '已提供' : '未提供');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.split(' ')[1];
      console.log('提取到API密钥:', apiKey ? '已提取' : '提取失败');
    } else {
      console.log('Authorization头格式错误或缺失');
    }
    
    // 调用阿里云百炼平台生成旅行计划，传递模型参数和API密钥
    const result = await aliyunBailianService.generateTravelPlan(content, model, apiKey);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: '生成旅行计划失败', error: error.message });
  }
});

/**
 * 回答旅行相关问题
 * POST /api/ai/ask-question
 */
router.post('/ask-question', async (req, res) => {
  try {
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: '问题不能为空' });
    }
    
    // 调用阿里云百炼平台处理问题
    const result = await aliyunBailianService.handleTravelQuery(query, context);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: '回答问题失败', error: error.message });
  }
});

/**
 * 推荐目的地
 * POST /api/ai/recommend-destinations
 */
router.post('/recommend-destinations', async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({ message: '偏好设置不能为空' });
    }
    
    // 调用阿里云百炼平台推荐目的地
    const result = await aliyunBailianService.recommendDestinations(preferences);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: '推荐目的地失败', error: error.message });
  }
});

// 为其他AI路由添加用户认证保护
router.use('/ask-question', protect);
router.use('/recommend-destinations', protect);

module.exports = router;