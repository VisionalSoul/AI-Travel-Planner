# 使用Debian作为基础镜像
FROM debian:11-slim

# 设置非交互式安装
env DEBIAN_FRONTEND=noninteractive

# 分批安装依赖以减少内存使用
# 第一步：更新系统并安装基础依赖
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y curl wget gnupg2 ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 第二步：安装Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs build-essential python3 && \
    npm install -g npm@11.6.2 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 第三步：安装服务依赖
RUN apt-get update && \
    apt-get install -y nginx default-mysql-server supervisor procps && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 创建必要的目录结构
RUN mkdir -p /var/log/supervisor /var/run/mysqld && \
    chown -R mysql:mysql /var/lib/mysql /var/run/mysqld && \
    chmod 755 /var/run/mysqld

# 构建后端应用
WORKDIR /app/backend
COPY ./backend/ .
RUN npm install --production --legacy-peer-deps --force && \
    npm rebuild bcrypt --build-from-source

# 构建前端应用
WORKDIR /app/frontend
COPY ./frontend/ .
RUN mkdir -p /var/www/html && \
    npm install --legacy-peer-deps --force && \
    npm run build && \
    cp -r dist/* /var/www/html/ && \
    rm -rf /app/frontend/node_modules

# 复制前端构建产物到Nginx目录
RUN rm -rf /usr/share/nginx/html/* && \
    cp -r /var/www/html/* /usr/share/nginx/html/

# 复制配置文件
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./docker/start.sh /usr/local/bin/
COPY ./docker/init-db.sh /app/docker/
RUN chmod +x /usr/local/bin/start.sh && chmod +x /app/docker/init-db.sh

# 设置环境变量
ENV NODE_ENV=production
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=ai_travel_planner
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=password
ENV OPENAI_API_KEY=sk-placeholder-key
ENV JWT_SECRET=ai_travel_planner_secure_jwt_secret_key_2024
ENV JWT_EXPIRES_IN=7d

# 暴露端口
EXPOSE 80 3306

# 启动服务
CMD ["start.sh"]