# AI-Travel-Planner

## 项目简介
AI-Travel-Planner是一个智能旅行规划助手，利用人工智能技术为用户提供个性化的旅行规划服务。该系统集成了智能行程生成、费用管理、语音交互、照片管理等功能，帮助用户轻松规划和管理旅行活动。

## 功能特点

### 核心功能
- **用户认证与管理**：用户注册、登录、个人信息管理
- **旅行计划管理**：创建、编辑、删除旅行计划
- **智能行程生成**：基于AI生成个性化行程建议
- **行程可视化**：交互式地图和行程时间线展示
- **语音交互**：语音指令和语音助手功能
- **费用管理**：旅行费用记录、分析和预算管理
- **照片管理**：旅行照片上传、分类和分享

### 技术特性
- 响应式设计，支持多设备访问
- 实时数据同步和更新
- 智能分析和推荐算法
- 安全的用户认证和数据加密

## 技术栈

### 前端
- Vue.js 3
- Element Plus
- Vue Router
- Axios

### 后端
- Node.js
- Express
- MongoDB
- OpenAI API (用于AI功能)

## 安装步骤

### 前置要求
- Node.js 14+
- MongoDB 4.0+
- npm 6.0+ 或 yarn

### 后端安装

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
# 复制并编辑.env文件
cp .env.example .env

# 启动后端服务
npm start
```

### 前端安装

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 配置环境变量（如需）
# 复制并编辑.env文件
cp .env.example .env

# 开发模式运行
npm run dev

# 构建生产版本
npm run build
```

## 使用方法

### 开发环境

1. **启动后端服务**
   - 确保MongoDB服务已启动
   - 运行`cd backend && npm start`
   - 后端服务默认运行在 http://localhost:3000

2. **启动前端开发服务器**
   - 运行`cd frontend && npm run dev`
   - 前端服务默认运行在 http://localhost:8080

3. **访问应用**
   - 在浏览器中打开 http://localhost:8080
   - 注册新用户或使用现有账户登录

### 主要功能使用

#### 创建旅行计划
1. 登录后，点击"创建新旅行"
2. 填写旅行基本信息（目的地、日期等）
3. 选择智能生成或手动添加行程

#### 智能行程生成
1. 在创建旅行时，选择"智能生成行程"
2. 提供您的偏好（景点类型、活动、预算等）
3. 系统将基于AI生成个性化行程建议

#### 费用管理
1. 进入具体旅行详情页
2. 点击"费用"标签
3. 添加、编辑或删除费用记录
4. 查看费用分析图表

#### 语音交互
1. 点击页面上的麦克风图标
2. 按照提示语音输入命令（如"显示我的行程"、"添加新费用"等）
3. 系统将识别并执行相应操作

## 部署方法

### 生产环境部署

#### 前端部署

```bash
# 进入前端目录
cd frontend

# 构建生产版本
npm run build

# 部署静态文件
# 可以使用Nginx、Apache等Web服务器部署build目录下的文件
```

#### 后端部署

```bash
# 进入后端目录
cd backend

# 安装生产依赖
npm install --production

# 设置环境变量（生产环境配置）
# 编辑.env文件，设置生产环境参数

# 使用PM2或其他进程管理器启动服务
npm install -g pm2
npm start # 或使用自定义脚本
```

### Docker部署

项目支持Docker部署，简化环境配置和部署流程。

```bash
# 克隆项目
# 构建和启动容器
docker-compose up -d
```

## 环境变量配置

### 后端环境变量 (.env)
```
# 数据库连接信息
MONGO_URI=mongodb://localhost:27017/ai-travel-planner

# 服务器配置
PORT=3000
NODE_ENV=production

# JWT配置
JWT_SECRET=your_jwt_secret_key

# OpenAI API配置（用于AI功能）
OPENAI_API_KEY=your_openai_api_key
```

### 前端环境变量 (.env)
```
# API基础URL
VUE_APP_API_BASE_URL=http://your-backend-api-url

# 其他前端配置
VUE_APP_ENV=production
```

## 项目结构

```
AI-Travel-Planner/
├── backend/            # 后端代码
│   ├── controllers/    # 控制器
│   ├── models/         # 数据模型
│   ├── routes/         # 路由定义
│   ├── services/       # 业务逻辑
│   └── config/         # 配置文件
├── frontend/           # 前端代码
│   ├── src/            # 源代码
│   │   ├── assets/     # 静态资源
│   │   ├── components/ # 组件
│   │   ├── views/      # 页面视图
│   │   ├── router/     # 路由配置
│   │   └── services/   # API服务
│   ├── public/         # 公共资源
│   └── dist/           # 构建输出目录
└── README.md           # 项目说明文档
```

## 贡献指南

欢迎对项目进行贡献！如果您有任何建议或想提交代码，请：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 许可证

该项目采用MIT许可证。详情请查看LICENSE文件。