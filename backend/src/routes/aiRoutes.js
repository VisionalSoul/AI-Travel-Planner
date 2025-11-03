const express = require('express');
const router = express.Router();
const aliyunBailianService = require('../services/aliyunBailianService');
const { protect } = require('../middleware/auth');

// 所有AI路由都需要认证
router.use(protect);

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
    
    // 调用阿里云百炼平台生成旅行计划
    const result = await aliyunBailianService.generateTravelPlan(content);
    
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

module.exports = router;