const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/db');

// 加载环境变量
dotenv.config();

// 创建express应用
const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(helmet());
app.use(express.json()); // 解析JSON请求体

// 路由
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '服务运行正常'
  });
});

// 404 处理
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: '路由不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器错误'
  });
});

// 获取端口
const PORT = process.env.PORT || 5000;

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});