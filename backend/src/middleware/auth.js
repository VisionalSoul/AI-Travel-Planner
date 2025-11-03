const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  // 检查Authorization头
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 提取token
      token = req.headers.authorization.split(' ')[1];

      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 获取用户信息（默认不包括密码，因为在模型中设置了defaultScope）
      req.user = await User.findByPk(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: '用户不存在' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: '未授权，请重新登录' });
    }
  }

  if (!token) {
    res.status(401).json({ message: '未授权，请重新登录' });
  }
};

module.exports = { protect };