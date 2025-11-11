#!/bin/bash

echo "=== AI旅行规划应用启动脚本 ==="

# 检查并创建必要的目录
echo "创建必要的目录..."
mkdir -p /var/run/mysqld /var/log/supervisor /var/log/mysql /var/log/nginx /var/log/backend
chown -R mysql:mysql /var/run/mysqld

# 检查MySQL数据目录是否存在，如果不存在则初始化
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "初始化MySQL数据目录..."
    mysqld --initialize-insecure --user=mysql
    chown -R mysql:mysql /var/lib/mysql
fi

# 确保初始化脚本有执行权限
chmod +x /app/docker/init-db.sh

# 配置nginx
echo "配置Nginx..."
rm -f /etc/nginx/sites-enabled/default
mkdir -p /etc/nginx/sites-enabled
if [ -f "/etc/nginx/conf.d/default.conf" ]; then
    ln -sf /etc/nginx/conf.d/default.conf /etc/nginx/sites-enabled/
else
    echo "Warning: Nginx配置文件不存在，将使用默认配置"
    echo 'server { listen 80; server_name localhost; root /var/www/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
    ln -sf /etc/nginx/conf.d/default.conf /etc/nginx/sites-enabled/
fi

# 确保前端文件目录存在
mkdir -p /var/www/html

# 配置supervisord
echo "配置Supervisor..."
mkdir -p /etc/supervisor/conf.d
if [ ! -f "/etc/supervisor/conf.d/supervisord.conf" ]; then
    echo "Warning: Supervisor配置文件不存在，创建默认配置"
    cat > /etc/supervisor/conf.d/supervisord.conf << 'EOF'
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:mysql]
command=/usr/sbin/mysqld
user=mysql
autostart=true
autorestart=true
priority=10
stdout_logfile=/var/log/mysql.log
stderr_logfile=/var/log/mysql.err

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
autostart=true
autorestart=true
priority=30
stdout_logfile=/var/log/nginx.log
stderr_logfile=/var/log/nginx.err

[program:backend]
command=node /app/backend/src/server.js
working_dir=/app/backend
autostart=true
autorestart=true
priority=20
stdout_logfile=/var/log/backend.log
stderr_logfile=/var/log/backend.err
environment=NODE_ENV="production",MYSQL_HOST="localhost",MYSQL_USER="ai_travel_planner",MYSQL_PASSWORD="yourpassword",MYSQL_DATABASE="ai_travel_planner",MYSQL_PORT="3306"

[program:wait-for-mysql]
command=/bin/bash -c "sleep 10 && /app/docker/init-db.sh"
autostart=true
priority=15
stdout_logfile=/var/log/init-db.log
stderr_logfile=/var/log/init-db.err
EOF
fi

# 启动supervisord管理所有服务
echo "启动所有服务..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf