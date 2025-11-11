# 构建阶段
FROM node:20.19-alpine AS build

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 设置国内npm镜像源加速安装
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 构建项目
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物到nginx目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制nginx配置文件到正确位置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]