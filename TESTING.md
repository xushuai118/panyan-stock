# 盘研智选 - 测试指南

## 前置条件

1. Docker 已安装并运行
2. Python 3.11+ 已安装
3. Node.js 20+ 已安装
4. npm 已安装

## 启动步骤

### 1. 启动数据库
cd D:\Projects\盘研智选
docker-compose up -d

等待 10 秒让数据库就绪。

### 2. 安装后端依赖
cd backend
pip install -r requirements.txt

### 3. 同步演示数据
python sync_data.py --demo

### 4. 启动后端
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

### 5. 启动前端（新终端）
cd frontend
npm install
npm run dev

## 功能测试

### 测试 1: 自然语言选股
1. 访问 http://localhost:3000
2. 在搜索框输入示例条件
3. 点击搜索
4. 查看筛选结果列表

### 测试 2: 个股详情
1. 在搜索结果中点击股票代码
2. 查看个股详情页

### 测试 3: API 调用
访问 http://localhost:8000/docs 查看 Swagger API 文档

## 常见问题

- 数据库连接失败：确保 Docker 正在运行
- 搜索结果为空：运行 python sync_data.py --demo
- AKShare 安装失败：演示模式不需要 AKShare
