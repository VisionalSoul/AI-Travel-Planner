const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 添加输入验证
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名、邮箱和密码不能为空' 
      });
    }

    // 检查用户名是否已存在
    const userExists = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });
    
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名或邮箱已被使用' 
      });
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password
    });

    // 生成JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({ message: '请输入邮箱和密码' });
    }

    // 查找用户（包含密码字段）
    const user = await User.findOne({
      where: { email },
      attributes: { include: ['password'] }
    });
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 生成JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    // 确保返回的用户对象不包含密码
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      profile: user.profile
    };

    res.status(200).json({
      success: true,
      token,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};