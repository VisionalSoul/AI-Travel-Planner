const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/db');

class User extends Model {
  // 密码验证方法 - 现在接收前端SHA-256哈希后的密码
  async correctPassword(candidatePassword, userPassword) {
    // 直接比较前端已哈希的密码和数据库中存储的bcrypt哈希值
    return await bcrypt.compare(candidatePassword, userPassword);
  }
  
  // 添加matchPassword方法作为correctPassword的别名，确保登录功能正常
  async matchPassword(candidatePassword) {
    return await this.correctPassword(candidatePassword, this.getDataValue('password'));
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: '用户名不能为空' },
      len: { args: [3, Infinity], msg: '用户名至少3个字符' }
    },
    set(value) {
      this.setDataValue('username', value.trim());
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: '邮箱不能为空' },
      isEmail: { msg: '请输入有效的邮箱地址' }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: '密码不能为空' },
      len: { args: [6, Infinity], msg: '密码至少6个字符' }
    },
    // 注意：这里只设置getter在查询时不返回密码，但保留setter功能
    get() {
      // 只有在查询时才返回undefined，创建时仍可访问
      const originalGetter = this.__proto__.__proto__.get;
      if (this.isNewRecord) {
        return originalGetter.call(this, 'password');
      }
      return undefined;
    }
  },
  profile: {
    type: DataTypes.JSON,
    defaultValue: {
      avatar: '',
      bio: '',
      preferences: {}
    }
  }
}, {
  sequelize,
  modelName: 'User',
  timestamps: true, // 自动生成createdAt和updatedAt
  hooks: {
    // 密码加密钩子
    beforeCreate: async (user) => {
      // 直接使用getDataValue来获取密码，避免getter的影响
      const password = user.getDataValue('password');
      if (!password) {
        throw new Error('密码不能为空');
      }
      // 确保直接使用传入的密码进行加密，不使用任何默认值
      user.setDataValue('password', await bcrypt.hash(password.toString(), 12));
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const password = user.getDataValue('password');
        if (!password) {
          throw new Error('密码不能为空');
        }
        // 确保直接使用传入的密码进行加密，不使用任何默认值
        user.setDataValue('password', await bcrypt.hash(password.toString(), 12));
      }
    }
  },
  defaultScope: {
    attributes: {
      exclude: ['password'] // 默认查询排除密码字段
    }
  }
});

module.exports = User;