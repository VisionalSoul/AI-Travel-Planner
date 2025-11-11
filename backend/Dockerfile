# 使用Node.js官方镜像，选择非Alpine版本以避免编译问题
FROM node:18.16.0-slim

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 设置国内npm镜像源加速安装
RUN npm config set registry https://registry.npmmirror.com

# 安装编译工具和依赖
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 安装依赖，添加--legacy-peer-deps以避免版本冲突
RUN npm install --production --legacy-peer-deps

# 复制源代码
COPY src/ ./src/
COPY init-db.sql ./

# 创建.env文件（基于.env.example）
COPY .env.example .env

# 暴露应用端口
EXPOSE 5000

# 设置启动命令
CMD ["node", "src/server.js"]