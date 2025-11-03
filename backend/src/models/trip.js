const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user');

class Trip extends Model {
  // 计算行程天数的方法
  getDuration() {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // 包含开始和结束日期
  }
}

Trip.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(1000), // 进一步增加长度限制
    allowNull: false,
    validate: {
      notEmpty: { msg: '行程标题不能为空' },
      len: { args: [1, 1000], msg: '行程标题长度必须在1-1000个字符之间' }
    },
    set(value) {
      this.setDataValue('title', value.trim());
    }
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: '目的地不能为空' }
    },
    set(value) {
      this.setDataValue('destination', value.trim());
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: { msg: '开始日期不能为空' }
    }
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: { msg: '结束日期不能为空' },
      isAfterStart(value) {
        if (value <= this.startDate) {
          throw new Error('结束日期必须在开始日期之后');
        }
      }
    }
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  itinerary: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  expenses: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  photos: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      travelType: [],
      accommodationType: [],
      interests: []
    }
  },
  generatedByAI: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Trip',
  timestamps: true,
  hooks: {
    beforeUpdate: (trip) => {
      trip.updatedAt = new Date();
    }
  }
});

// 建立关联关系
User.hasMany(Trip, {
  foreignKey: 'userId',
  as: 'trips'
});

Trip.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = Trip;