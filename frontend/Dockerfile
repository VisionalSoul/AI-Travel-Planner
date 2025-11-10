# 构建阶段
FROM node:18-alpine AS build

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 构建项目
RUN npm run build

# 生产阶段
FROM nginx:1.25-alpine

# 添加调试信息
RUN echo "Building with custom nginx config"

# 复制构建产物到nginx目录
COPY --from=build /app/dist /usr/share/nginx/html

# 直接从当前上下文复制nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 验证配置文件是否正确复制
RUN echo "Verifying configuration was copied successfully..."
RUN cat /etc/nginx/conf.d/default.conf | grep -q "location /api/" && echo "API location found in config" || echo "ERROR: API location not found in config"

# 显示配置文件是否存在（用于调试）
RUN echo "Checking nginx configuration files..."
RUN ls -la /etc/nginx/conf.d/
RUN cat /etc/nginx/conf.d/default.conf | grep -A 10 "location /api" || echo "No /api location found in config"

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]