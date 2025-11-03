const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController'); // 确保authController已更新为使用Sequelize模型
const { protect } = require('../middleware/auth'); // 确保auth中间件也兼容Sequelize模型的用户对象

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;