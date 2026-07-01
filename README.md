# 盘研智选 - AI 驱动的智能选股平台

> 用自然语言提问，让 AI 帮你从 A 股中筛出符合策略的标的

## 快速开始

### 一键启动（推荐）

```powershell
# 双击运行
start_all.bat
```

### 手动启动

#### 1. 启动基础设施
```powershell
docker-compose up -d
```

#### 2. 同步数据（演示用）
```powershell
cd backend
python sync_data.py --demo
```

#### 3. 启动后端
```powershell
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### 4. 启动前端
```powershell
cd frontend
npm install
npm run dev
```

## 访问地址

- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 + TypeScript + TailwindCSS |
| 后端 | FastAPI + SQLAlchemy + asyncio |
| 数据库 | PostgreSQL + TimescaleDB |
| 数据源 | AKShare |
| AI | 内置评分引擎（可扩展至 LLM） |

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/screen` | 自然语言选股 |
| GET | `/api/v1/stock/{code}` | 个股详情 |
| GET | `/api/v1/metadata/industries` | 行业列表 |
| GET | `/api/v1/metadata/sectors` | 板块列表 |

## 使用示例

在搜索框中输入：

- `筛选 ROE 大于 15% 的白酒股`
- `市值大于 500 亿的低市盈率股票`
- `今日上涨的半导体板块`

## 项目结构

```
盘研智选/
+- frontend/              # Next.js 前端
|| +- src/app/
|| | +- page.tsx       # 首页（搜索 + 结果列表）
|| | +- stock/[code]/  # 个股详情页
|| +- tailwind.config.js
+- backend/               # FastAPI 后端
|| +- app/
|| | +- api/v1/        # API 路由
|| | +- models/        # 数据库模型
|| | +- schemas/       # Pydantic 模型
|| | +- services/      # 业务逻辑
|| | +- core/          # 配置和数据库
|| +- sync_data.py       # 数据同步脚本
|| +- requirements.txt
+- docker-compose.yml     # Docker 基础设施
+- start_all.bat          # 一键启动脚本
```
