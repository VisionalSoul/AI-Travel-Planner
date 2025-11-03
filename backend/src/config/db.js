const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Sequelize实例
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    port: process.env.MYSQL_PORT || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // 添加字符集配置，解决中文乱码问题
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      supportBigNumbers: true,
      bigNumberStrings: true
    }
  }
);

// 连接数据库
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL 连接成功');
    
    // 自动同步模型到数据库
    await sequelize.sync({
      alter: process.env.NODE_ENV === 'development' // 在开发环境下自动修改表结构
    });
    console.log('数据库模型同步成功');
  } catch (error) {
    console.error(`MySQL 连接失败: ${error.message}`);
    process.exit(1); // 退出进程
  }
};

module.exports = { connectDB, sequelize };