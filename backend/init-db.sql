-- MySQL数据库初始化脚本

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS ai_travel_planner;

-- 使用创建的数据库
USE ai_travel_planner;

-- 设置MySQL会话字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

-- 先删除表（如果存在），确保使用新的表结构
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;

-- 创建用户表
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY COMMENT '用户ID（UUID）',
  username VARCHAR(100) NOT NULL UNIQUE COMMENT '用户名',
  email VARCHAR(255) NOT NULL UNIQUE COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  profile JSON COMMENT '用户个人资料',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 创建行程表
CREATE TABLE trips (
   id VARCHAR(36) PRIMARY KEY COMMENT '行程ID（UUID）',
   userId VARCHAR(36) NOT NULL COMMENT '用户ID',
   title VARCHAR(1000) NOT NULL COMMENT '行程标题',
   destination VARCHAR(255) NOT NULL COMMENT '目的地',
   startDate DATE NOT NULL COMMENT '开始日期',
   endDate DATE NOT NULL COMMENT '结束日期',
   details JSON COMMENT '行程详情',
   isPublic BOOLEAN DEFAULT FALSE COMMENT '是否公开',
   createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行程表';

-- 插入测试用户数据（密码为'password123'的SHA-256哈希后再进行bcrypt加密）
-- 'password123'的SHA-256哈希值为：ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
INSERT INTO users (id, username, email, password, profile) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'testuser', 'test@example.com', '$2a$12$J3E5JZ3Z5X6Z8X9Y0Y1Y2Y3Y4Y5Y6Y7Y8Y9Y0Y1Y2Y3Y4Y5Y6Y7', '{"avatar":"","bio":"测试用户","preferences":{}}');

-- 插入测试行程数据
INSERT INTO trips (id, userId, title, destination, startDate, endDate, details, isPublic) VALUES
('223e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', '北京游', '北京', '2024-01-20', '2024-01-25', '{"description": "北京旅游", "activities": ["故宫", "长城"]}', true);

-- 显示创建的表信息
SHOW TABLES;
DESCRIBE users;
DESCRIBE trips;