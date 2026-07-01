# 盘研智选 - CodeX 开发指令（V2 免费路线）

## 技术路线（已确定，不要改）
- 前端：Next.js（已有框架，保持不变）
- 部署：Vercel（免费，Next.js原生支持）
- 数据库：Supabase（免费，PostgreSQL，用户数据存这里）
- 行情数据：免费公开API直连（不经过后端）
  - A股：东方财富免费接口
  - 港股：新浪财经免费接口
  - 美股：TwelveData免费key
  - AI分析：DeepSeek API（用户自己的key）
- ❌ 不要Flask后端，不要Docker，不要Redis

## 当前已完成的工作
- ✅ Next.js前端项目框架已搭好
- ✅ 页面目录已创建
- ✅ Flask后端代码已写了（但不用了）
- ❌ docker-compose.yml、backend/ 目录可以删掉
- ❌ 需要改造现有前端页面，把调后端的接口换成调Supabase

## 分工方案（禁止越界）

| 角色 | 职责 | 不准做 |
|------|------|--------|
| **锐策（我）** | 出方案、设计表结构、写验收标准、review代码、写精确执行指令 | 不改前端文件 |
| **CodeX（你）** | 按本 prompt 的逐行精确指令机械执行代码修改 | 不改方案、不改数据结构、不准跳过步骤 |
| **麦子（老板）** | 提需求、定优先级、确认上线 | 不需要盯代码 |

---

## V2 完整解决方案（方案参考，执行时按下方步骤）

### Supabase 表结构（等第一步 review 通过后再创建）

```sql
-- 1. 自选股表
CREATE TABLE watchlists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stock_code VARCHAR(10) NOT NULL,
  stock_name VARCHAR(50) NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, stock_code)
);
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户只能看自己的自选" ON watchlists
  FOR ALL USING (auth.uid() = user_id);

-- 2. 持仓记录表（手动录入）
CREATE TABLE portfolios (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stock_code VARCHAR(10) NOT NULL,
  stock_name VARCHAR(50) NOT NULL,
  shares DECIMAL(12,2) NOT NULL,
  avg_cost DECIMAL(10,2) NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stock_code)
);
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户只能看自己的持仓" ON portfolios
  FOR ALL USING (auth.uid() = user_id);
```

### 东方财富 API 字段映射（对照确认，不准猜）

**行情接口** `push2.eastmoney.com/api/qt/stock/get`

| 字段 | 含义 | 类型 |
|------|------|------|
| f2 | 最新价 | number |
| f3 | 涨跌幅 % | number |
| f4 | 涨跌额 | number |
| f5 | 成交量（手） | number |
| f6 | 成交额 | number |
| f7 | 今开 | number |
| f8 | 最高 | number |
| f9 | 最低 | number |
| f10 | 昨收 | number |
| f12 | **股票代码** | string |
| f14 | **股票名称** | string |
| f17 | 总市值 | number |
| f18 | 流通市值 | number |
| f19 | PE（动） | number |
| f20 | 流通市值 | number（若需） |
| f25 | 换手率 % | number |

**指数行情** `push2.eastmoney.com/api/qt/ulist.np/get`

| 字段 | 含义 |
|------|------|
| f12 | **代码**（如 1.000001） |
| f14 | **名称** |
| f2 | 最新点数 |
| f3 | 涨跌幅 % |
| f4 | 涨跌点 |

**搜索接口** `searchadapter.eastmoney.com/api/suggest/get`

| 路径 | 含义 |
|------|------|
| QueryResult[0].InstrumentList[0].Code | 股票代码 |
| QueryResult[0].InstrumentList[0].ShortName | 股票名称 |
| QueryResult[0].InstrumentList[0].Market | 市场类型 |

### 前端页面详细设计

#### 页面 1 — 首页（搜索+筛选）
- 顶部：指数行情横向滚动条（6个A股指数）
- Tab 切换：`股票搜索` / `选股筛选`
- 搜索面板：输入框 + 搜索按钮 → 结果列表（代码+名称+操作按钮）
- 筛选面板：PE区间/市值/行业 四个筛选条件 + 开始筛选按钮 → 结果列表（含价格、涨跌幅）
- 每条结果可点击进入详情页、可加入自选

#### 页面 2 — 个股详情 `/stock/[code]`
- 顶部：股票名称/代码 + 当前价格 + 涨跌幅
- 指标卡：开盘/最高/最低/成交量
- 财务指标区：PE / 总市值 / 换手率（数据来自东方财富行情接口）
- 加自选按钮

### 验收标准（交付前必须自测通过）

| 功能 | 验收条件 |
|------|----------|
| Bug 修复 | `npm run build` 编译通过，搜索显示正常，PE 显示正确数字 |
| 搜索 | 输入"茅台"能搜到贵州茅台，点击"查看详情"跳转正常 |
| 个股详情 | 打开 `/stock/600519` 显示价格/涨跌幅/PE/市值 |
| 自选股 | 点击"+ 自选"后，数据实际插入 Supabase watchlists 表，alert 去掉 |
| 筛选 | 点击"开始筛选"调用真实数据（不返回 mock） |

---

## ⚠️ 执行守则（必须逐条遵守）

**守则1：每步做完必须 STOP**
- 每一步末尾标注了 `⏸️ STOP`，做完该步后**立即停止**
- 不往下做，不等指令，等锐策 review 通过后再继续

**守则2：只改本步骤指定的文件**
- 不准顺手修其他文件，不准做"顺便优化"
- 改完立刻用下方验证命令确认

**守则3：精确执行，不议价**
- 下方"变更指令"中的代码是最终答案
- 不需要你判断"要不要这样改"，直接替换
- 不需要你理解东方财富 API 结构，按指定的字段名写

**守则4：验证命令必须跑，看输出**
- 每个变更下方有 `sed` 或 `grep` 验证命令
- 跑完之后确认输出匹配预期值，不匹配就是没改对

---

## 第一步：修 Bug（精确变更，逐行可验证）

> **影响文件：** `frontend/src/lib/stock-api.ts`

### 改点 A — getMarketIndices（第 8-9 行）

**旧代码：**
```
code: item.f14,   // 错误
name: item.f12,   // 错误
```

**新代码：**
```
code: item.f12,   // f12 = 股票代码
name: item.f14,   // f14 = 股票名称
```

✅ **验证：** 运行 `sed -n '7,10p' frontend/src/lib/stock-api.ts`
期望看到第 8 行有 `code: item.f12`，第 9 行有 `name: item.f14`

### 改点 B — getStockQuote（第 41 行）

**旧代码：**
```
const item = data.data;
```

**新代码：**
```
const raw = data.data?.data;
// 注意：东方财富 stock/get 返回 { rc, data: { f2, f3, ... } }
// API route 透传为 { code: 0, data: { rc, data: { f2, ... } } }
// 所以 data.data 拿到 { rc, data: { f2, ... } }
// data.data?.data 才拿到 { f2, f3, ... }
// 变量改名 raw，避免和旧 item 混淆
```

### 改点 C — getStockQuote 余下所有字段引用（第 43-59 行）

**所有 `item.fXX` 改为 `raw.fXX`**

匹配规则：找到所有以 `item.f` 开头的行，替换为 `raw.f`

| 旧 | 新 |
|---|---|
| `code: item.f14,` | `code: raw.f12,` |
| `name: item.f12,` | `name: raw.f14,` |
| `price: item.f2,` | `price: raw.f2,` |
| `changePct: item.f3,` | `changePct: raw.f3,` |
| `change: item.f4,` | `change: raw.f4,` |
| `volume: item.f5,` | `volume: raw.f5,` |
| `amount: item.f6,` | `amount: raw.f6,` |
| `open: item.f7,` | `open: raw.f7,` |
| `high: item.f8,` | `high: raw.f8,` |
| `low: item.f9,` | `low: raw.f9,` |
| `prevClose: item.f10,` | `prevClose: raw.f10,` |
| `turnoverRate: item.f25,` | `turnoverRate: raw.f25,` |
| `pe: item.f19,` | `pe: raw.f19,` |
| `marketCap: item.f17,` | `marketCap: raw.f17,` |
| `circMarketCap: item.f18,` | `circMarketCap: raw.f18,` |

✅ **验证：** 运行 `sed -n '38,60p' frontend/src/lib/stock-api.ts`
期望：第 41 行是 `const raw = data.data?.data;`，且没有任何 `item.f` 出现

### 最终验证

```bash
cd frontend && npm run build
```
期望：编译零错误通过

---

**⏸️ STOP。** 不要做下面的步骤。等锐策 review 通过后再继续。

---

## 第二步：个股详情页加「加自选」按钮（先不要做，等第一步 review 通过）

> **影响文件：** `frontend/src/app/stock/[code]/page.tsx`

### 改点 D — 加入 supabase import

在 `import { getStockQuote } from '@/lib/stock-api';` 行下方插入：
```typescript
import { supabase } from '@/lib/supabase';
```

### 改点 E — 加入 addToWatchlist 函数

在 StockDetailPage 组件的 `return (` 语句之前插入：
```typescript
const addToWatchlist = async () => {
  if (!stock) return;
  const { error } = await supabase.from('watchlists').insert({
    stock_code: stock.code,
    stock_name: stock.name,
  });
  if (error) {
    alert('添加失败：' + error.message);
  } else {
    alert('已添加到自选股');
  }
};
```

### 改点 F — 在模板中加入按钮

在 `<h1>` 所在行的 children 中，`{stock.name}` 之后插入：
```tsx
<button onClick={addToWatchlist} className="ml-3 text-sm text-blue-600 border border-blue-600 rounded px-2 py-1 hover:bg-blue-50">+ 自选</button>
```

✅ **验证：** 运行 `grep -n 'addToWatchlist\|supabase\|自选' frontend/src/app/stock/\[code\]/page.tsx`
期望：找到 3 处相关代码

---

**⏸️ STOP。** 等锐策 review。

---

## 开发要求
1. 先删掉不需要的后端代码（backend/、docker-compose.yml）
2. 所有API调用改成从浏览器直接请求公开接口
3. 用户数据（自选股、持仓）通过Supabase SDK存取
4. API key放环境变量，不要硬编码
5. 中文界面，移动端适配
6. 只写前端代码，不涉及后端
7. 所有调后端的代码用注释 TODO: 对接Supabase 标记
