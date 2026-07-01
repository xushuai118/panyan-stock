# STEP_05 — 选股筛选器联调真实数据

## ⚠️ 执行守则
1. 先读 `CODEX_PROMPT.md` 了解方案背景
2. **只改本步骤指定的文件和内容**，不准做任何额外修改
3. 每步做完跑验证命令确认
4. **做完 STOP，等锐策 review，不准做下一步**

---

## 问题背景

当前"选股筛选"面板的 `handleScreen` 函数返回的是硬编码的 mock 数据（贵州茅台、五粮液、美的集团），无论用户输入什么筛选条件都不变。

**解决方案：** 调东方财富的 A 股列表 API 获取真实行情数据，在前端做 PE/市值/行业筛选。

---

## 影响文件

| 文件 | 操作 |
|------|------|
| `frontend/src/app/api/stocks/route.ts` | 新增 `type=screen` 分支 |
| `frontend/src/app/page.tsx` | 替换 handleScreen 函数 |

---

## 精确改动

### 改点 A — API Route 新增 screen 类型

**影响文件：** `frontend/src/app/api/stocks/route.ts`

在 `if (type === 'indices')` 分支之前，插入以下内容：

```typescript
    if (type === 'screen') {
      // 获取 A 股列表（按成交额排序，一次拿 500 只）
      const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=500&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f20&fs=m:90+t:2&fields=f12,f14,f2,f3,f19,f17,f20`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      const data = await res.json();
      return NextResponse.json({ code: 0, data });
    }
```

✅ **验证：** `grep -n "type === 'screen'" frontend/src/app/api/stocks/route.ts`
期望：找到 1 处

---

### 改点 B — 替换 page.tsx 的 handleScreen 函数

**影响文件：** `frontend/src/app/page.tsx`

#### B1 — 删除 import 中未使用的 getStockQuote

当前第 5 行：
```tsx
import { getMarketIndices, searchStocks, getStockQuote } from '@/lib/stock-api';
```

改为：
```tsx
import { getMarketIndices, searchStocks } from '@/lib/stock-api';
```

因为筛选不需要调 getStockQuote。

#### B2 — 替换 handleScreen 函数

**旧代码（第 31-39 行）：**
```typescript
  const handleScreen = async () => {
    setLoading(true);
    setScreenResults([
      { code: '600519', name: '贵州茅台', price: 1800.50, changePct: 2.3, pe: 35.2, marketCap: 22500 },
      { code: '000858', name: '五粮液', price: 150.30, changePct: -1.2, pe: 25.8, marketCap: 3500 },
      { code: '000333', name: '美的集团', price: 65.80, changePct: 0.5, pe: 12.5, marketCap: 4600 },
    ]);
    setLoading(false);
  };
```

**新代码：**
```typescript
  const handleScreen = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stocks?type=screen');
      const json = await res.json();
      const list = json.data?.diff || [];

      const minPeNum = minPe ? Number(minPe) : -Infinity;
      const maxPeNum = maxPe ? Number(maxPe) : Infinity;
      const minCapNum = minMarketCap ? Number(minMarketCap) * 10000 : 0; // 用户输入亿，接口返回万
      const keyword = industry.trim().toLowerCase();

      const filtered = list.filter((item: any) => {
        const pe = item.f19;
        const cap = item.f17;
        const name = (item.f14 || '').toLowerCase();

        // PE 筛选（排除负数，排除空值）
        if (pe == null || pe === '-' || Number(pe) <= 0) return false;
        if (Number(pe) < minPeNum || Number(pe) > maxPeNum) return false;

        // 市值筛选
        if (cap == null || Number(cap) < minCapNum) return false;

        // 行业筛选（按名称关键词匹配）
        if (keyword && !name.includes(keyword)) return false;

        return true;
      });

      setScreenResults(
        filtered.map((item: any) => ({
          code: item.f12,
          name: item.f14,
          price: item.f2,
          changePct: item.f3,
          pe: item.f19,
          marketCap: item.f17 ? Math.round(item.f17 / 10000) : 0, // 转为亿
        }))
      );
    } catch (e) {
      console.error('筛选失败:', e);
      alert('筛选请求失败，请稍后重试');
    }
    setLoading(false);
  };
```

✅ **验证：** `grep -n "handleScreen\|f12\|type=screen" frontend/src/app/page.tsx`
期望：找到 handleScreen 函数定义，包含 `f12`、`f19`、`f17` 等字段引用

---

## 最终验证

```bash
cd D:/Projects/盘研智选/frontend
npm run build
```
期望：编译零错误通过

---

## ⏸️ STOP

改完 + build 验证通过后停止，等锐策 review。
不准做任何额外修改。
