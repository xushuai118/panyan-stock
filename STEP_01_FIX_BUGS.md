# STEP_01 — 修 Bug：f12/f14 字段映射 + 数据结构修正

> ⚠️ **执行守则：**
> 1. 只改本步骤指定的文件（`frontend/src/lib/stock-api.ts`）
> 2. 改完立刻跑验证命令确认
> 3. **做完 STOP，等锐策 review，不要做下一步**

---

## 影响文件

`frontend/src/lib/stock-api.ts`

## 改点清单

### 改点 A — getMarketIndices（第 8-9 行）

**旧代码：**
```typescript
      code: item.f14,   // 错误
      name: item.f12,   // 错误
```

**新代码：**
```typescript
      code: item.f12,   // f12 = 股票代码
      name: item.f14,   // f14 = 股票名称
```

✅ **验证：** `sed -n '7,10p' frontend/src/lib/stock-api.ts`
期望第 8 行 `code: item.f12`，第 9 行 `name: item.f14`

---

### 改点 B — getStockQuote 数据结构修正（第 41 行）

**旧代码：**
```typescript
    const item = data.data;
```

**新代码：**
```typescript
    const raw = data.data?.data;
```

原因：东方财富 `/api/qt/stock/get` 返回 `{ rc, data: { f2, f3, ... } }`，
API route 透传为 `{ code: 0, data: { rc, data: { f2, ... } } }`，
所以 `data.data` 拿到 `{ rc, data: { f2, ... } }`，
需要 `data.data?.data` 才拿到 `{ f2, f3, ... }`。
变量改名 `raw` 避免混淆。

---

### 改点 C — getStockQuote 余下所有字段引用（第 43-59 行）

**全部 `item.fXX` 改为 `raw.fXX`**，并对改点 A 也修正字段对应关系：

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

✅ **验证：** `sed -n '38,60p' frontend/src/lib/stock-api.ts`
期望：第 41 行 `const raw = data.data?.data;`，没有任何 `item.f` 出现

---

## 最终验证

```bash
cd frontend && npm run build
```
期望：编译零错误通过

---

## ⏸️ STOP

改完上面 3 个改点 + 跑完验证。不准做任何额外修改。等锐策 review。
