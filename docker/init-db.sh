#!/bin/bash

set -e  # 遇到错误时退出脚本

# 使用环境变量，提供默认值
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_ADMIN="mysqladmin"
MYSQL_CLIENT="mysql"
DB_NAME="${MYSQL_DATABASE:-ai_travel_planner}"
DB_USER="${MYSQL_USER:-user}"
DB_PASSWORD="${MYSQL_PASSWORD:-password}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root}"
MAX_RETRIES=30
RETRY_INTERVAL=5

# 等待MySQL启动
wait_for_mysql() {
  echo "等待MySQL启动..."
  local counter=0
  
  while [ $counter -lt $MAX_RETRIES ]; do
    if $MYSQL_ADMIN -p"$MYSQL_ROOT_PASSWORD" ping -u root --silent; then
      echo "MySQL已启动成功"
      return 0
    fi
    
    echo "MySQL尚未启动，$((MAX_RETRIES - counter))秒后重试..."
    sleep $RETRY_INTERVAL
    counter=$((counter + 1))
  done
  
  echo "错误：等待MySQL启动超时"
  return 1
}

# 检查数据库是否已初始化
check_database_initialized() {
  echo "检查数据库是否已初始化..."
  if $MYSQL_CLIENT -u root -p"$MYSQL_ROOT_PASSWORD" -e "USE $DB_NAME; SHOW TABLES;" > /dev/null 2>&1; then
    echo "数据库 $DB_NAME 已初始化"
    return 0
  fi
  return 1
}

# 创建数据库和用户
setup_database() {
  echo "创建数据库和用户..."
  $MYSQL_CLIENT -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%';
FLUSH PRIVILEGES;
EOF
  
  echo "数据库和用户创建成功"
}

# 导入初始数据
import_initial_data() {
  if [ -f "/app/backend/init-db.sql" ]; then
    echo "导入初始数据..."
    $MYSQL_CLIENT -u root -p"$MYSQL_ROOT_PASSWORD" $DB_NAME < /app/backend/init-db.sql
    echo "初始数据导入成功"
  else
    echo "警告：未找到初始化SQL文件 /app/backend/init-db.sql"
    
    # 如果没有初始化SQL文件，创建基本表结构
    echo "创建基本表结构..."
    $MYSQL_CLIENT -u root -p"$MYSQL_ROOT_PASSWORD" $DB_NAME <<EOF
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    destination VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS itineraries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    day_number INT NOT NULL,
    activity VARCHAR(255) NOT NULL,
    location VARCHAR(100) NOT NULL,
    activity_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id)
);
EOF
    
    echo "基本表结构创建成功"
  fi
}

# 主流程
echo "=== 开始数据库初始化 ==="

# 等待MySQL启动
if ! wait_for_mysql; then
  echo "错误：无法启动MySQL，跳过数据库初始化"
  exit 1
fi

# 检查是否已初始化
if check_database_initialized; then
  echo "数据库已初始化，跳过设置步骤"
else
  # 设置数据库
  setup_database
  
  # 导入数据
  import_initial_data
fi

echo "=== 数据库初始化完成 ==="
exit 0