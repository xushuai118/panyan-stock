# STEP_03 — Supabase 配置 + 自选股功能

## ⚠️ 执行守则
1. 先读 `CODEX_PROMPT.md` 了解方案背景
2. 只改本步骤指定的文件
3. 每步做完跑验证命令确认
4. **做完 STOP，等锐策 review，不准做下一步**

---

## 分工说明

| 步骤 | 谁做 | 内容 |
|------|------|------|
| Phase 1（手动） | **麦子** | 注册 Supabase + 建表 + 获取 Key |
| Phase 2（代码） | **Codex** | 写 env.local + 改页面代码 |

---

## Phase 1 — 麦子手动操作（先做完，再让 Codex 干 Phase 2）

### 1.1 注册 Supabase 项目

1. 打开 https://supabase.com/dashboard/projects
2. 点击 **New project**
3. 填写：
   - **Name**: `panyan-stock`
   - **Database Password**: 自己记好就行
   - **Region**: 选 **Singapore**（离国内近，免费套餐）
   - **Pricing Plan**: Free
4. 点击 Create project，等一两分钟初始化完成

### 1.2 获取 API Key

项目创建好后，进入项目首页：
- **Project Settings → API** → 复制以下两个值：

| 变量名 | 从哪里拿 |
|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → **Project URL**（类似 `https://xxx.supabase.co`） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → **anon public**（以 `eyJ` 开头的一长串） |

> 把这两个值记下来，Phase 2 Codex 会用到

### 1.3 建表（在 Supabase SQL Editor 执行）

1. 进入 **SQL Editor**
2. 点击 **New query**
3. 粘贴以下 SQL：

```sql
-- 1. 自选股表
CREATE TABLE watchlists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  stock_code VARCHAR(10) NOT NULL,
  stock_name VARCHAR(50) NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, stock_code)
);

ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

-- 允许用户查看自己的自选
CREATE POLICY "用户只能看自己的自选" ON watchlists
  FOR SELECT USING (auth.uid() = user_id);

-- 允许用户添加自己的自选
CREATE POLICY "用户只能添加自己的自选" ON watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 允许用户删除自己的自选
CREATE POLICY "用户只能删除自己的自选" ON watchlists
  FOR DELETE USING (auth.uid() = user_id);
```

4. 点击 **Run** 执行

✅ **验证：** 左侧 Table Editor 里能看到 `watchlists` 表

---

## Phase 2 — Codex 执行代码改动

> **前提：** 麦子 Phase 1 已完成后，把 Supabase URL 和 Anon Key 给你

### 2.1 写 `.env.local`

**影响文件：** `frontend/.env.local`

写入以下内容（把 `你的URL` 和 `你的Key` 替换成麦子给的值）：

```
NEXT_PUBLIC_SUPABASE_URL=你的URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Key
```

✅ **验证：** `grep -c "NEXT_PUBLIC_SUPABASE" frontend/.env.local`
期望输出：`2`

---

### 2.2 首页 — addToWatchlist 改为真实入库

**影响文件：** `frontend/src/app/page.tsx`

#### 改点 A — 替换 addToWatchlist 函数（第 59-62 行）

**旧代码：**
```typescript
  const addToWatchlist = async (stock: any) => {
    // TODO: 对接 Supabase 自选股表
    alert('已添加到自选股');
  };
```

**新代码：**
```typescript
  const addToWatchlist = async (stock: any) => {
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

✅ **验证：** `grep -n "addToWatchlist\|supabase.from" frontend/src/app/page.tsx`
期望：`addToWatchlist` 函数体内出现 `supabase.from('watchlists').insert`

---

### 2.3 个股详情页 — 加自选按钮

**影响文件：** `frontend/src/app/stock/[code]/page.tsx`

#### 改点 B — 导入 supabase

在文件顶部，`import { getStockQuote } from '@/lib/stock-api';` 行下方插入一行：
```typescript
import { supabase } from '@/lib/supabase';
```

#### 改点 C — 加入 addToWatchlist 函数

在 `const changeColor` 行上方（第 50 行左右）插入：
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

#### 改点 D — 模板中加按钮

在当前 `<h1>` 的 children 中，`{stock.name}` 之后插入按钮。

**改前（第 64 行附近）：**
```tsx
              <h1 className="text-2xl font-bold text-content-1">
                {stock.name} <span className="text-content-3 text-base font-normal">{'('}{stock.code}{')'}</span>
              </h1>
```

**改后：**
```tsx
              <h1 className="text-2xl font-bold text-content-1">
                {stock.name} <span className="text-content-3 text-base font-normal">{'('}{stock.code}{')'}</span>
                <button onClick={addToWatchlist} className="ml-3 text-sm text-blue-600 border border-blue-600 rounded px-2 py-1 hover:bg-blue-50">+ 自选</button>
              </h1>
```

✅ **验证：** `grep -n "addToWatchlist\|supabase\|自选" frontend/src/app/stock/\[code\]/page.tsx`
期望：找到 3 处相关代码（import + 函数定义 + 按钮模板）

---

### 2.4 最终验证

```bash
cd D:/Projects/盘研智选/frontend
npm run build
```
期望：编译零错误通过

---

## ⏸️ STOP

全部改完 + build 验证通过后停止，等锐策 review。
