# AI-Travel-Planner Docker使用说明

本项目提供了完整的Docker支持，使您能够轻松地在任何支持Docker的环境中部署和运行AI旅行规划器应用。

## 快速开始

### 前置条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)
- 克隆本项目到本地

### 环境变量配置

如果您需要使用阿里云百炼平台，可以在启动前设置以下环境变量：

```bash
# Linux/Mac
export ALIYUN_BAILIAN_API_KEY=your_api_key

# Windows (PowerShell)
$env:ALIYUN_BAILIAN_API_KEY="your_api_key"
```

### 启动应用

在项目根目录执行以下命令启动所有服务：

```bash
docker-compose up -d
```

这将启动三个容器：
- `ai_travel_planner_db`: MySQL数据库
- `ai_travel_planner_backend`: 后端Node.js服务
- `ai_travel_planner_frontend`: 前端Vue应用

### 访问应用

启动成功后，您可以通过以下地址访问应用：
- 前端应用: http://localhost
- 后端API: http://localhost:5000

## 详细配置说明

### 服务组件

1. **MySQL数据库**
   - 端口映射: 3306:3306
   - 数据持久化: 使用Docker卷 `db_data`
   - 初始化脚本: 通过 `init-db.sql` 自动创建数据库结构

2. **后端服务**
   - 基于Node.js 18 Alpine镜像
   - 端口映射: 5000:5000
   - 依赖MySQL服务，确保数据库启动正常后才启动

3. **前端服务**
   - 基于Nginx Alpine镜像
   - 使用多阶段构建减小镜像体积
   - 端口映射: 80:80
   - 依赖后端服务

### 自定义配置

#### 修改数据库配置

可以在 `docker-compose.yml` 中修改数据库相关配置：

```yaml
db:
  environment:
    MYSQL_ROOT_PASSWORD: your_new_password
    MYSQL_DATABASE: ai_travel_planner
    MYSQL_USER: your_new_user
    MYSQL_PASSWORD: your_new_user_password
```

#### 修改JWT密钥

在生产环境中，请务必修改JWT密钥：

```yaml
backend:
  environment:
    JWT_SECRET: your_secure_jwt_secret_key
```

## 常用命令

### 启动所有服务
```bash
docker-compose up -d
```

### 查看服务状态
```bash
docker-compose ps
```

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
```

### 停止所有服务
```bash
docker-compose down
```

### 停止并删除数据卷
```bash
docker-compose down -v
```

## 开发注意事项

1. 前端开发时，`VITE_API_URL` 环境变量设置为后端API地址
2. 数据库初始化脚本会在首次启动时自动执行
3. 所有服务配置都通过Docker Compose环境变量注入，无需修改代码

## 安全建议

1. 生产环境中务必修改默认密码和JWT密钥
2. 不要在公共环境中暴露数据库端口
3. 定期更新Docker镜像到最新版本
4. 考虑添加HTTPS支持，特别是在生产环境中