# 使用Node.js官方镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制源代码
COPY src/ ./src/
COPY init-db.sql ./

# 创建.env文件（基于.env.example）
COPY .env.example .env

# 暴露应用端口
EXPOSE 5000

# 设置启动命令
CMD ["node", "src/server.js"]