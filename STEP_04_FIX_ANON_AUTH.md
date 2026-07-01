# STEP_04_FIX — 修正 AuthProvider 加载状态（不允许返回 html/body）

## ⚠️ 执行守则
1. **只改本步骤指定的文件和内容**，不准做任何额外修改
2. 每步做完跑验证命令确认
3. **做完 STOP，等锐策 review，不准做下一步**

---

## 问题说明

`AuthProvider.tsx` 当前的 loading 状态返回了 `<html><body>...</body></html>`，这会导致嵌套在 RootLayout 的 `<body>` 里面，产生非法 HTML 结构，可能引发 hydration 警告。

**修正方法：** loading 状态只返回 `<div>`，不要返回 `<html>` 和 `<body>`。

---

## 影响文件

`frontend/src/components/AuthProvider.tsx`

---

## 精确改动

### 改点 — 替换 loading 状态返回值

**旧代码（第 62-70 行）：**
```tsx
  if (!ready) {
    return (
      <html lang="zh-CN">
        <body className="font-sans bg-bg-page text-content-1">
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-content-3">加载中...</p>
          </div>
        </body>
      </html>
    );
  }
```

**新代码：**
```tsx
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page">
        <p className="text-content-3">加载中...</p>
      </div>
    );
  }
```

✅ **验证：** `grep -n "html" frontend/src/components/AuthProvider.tsx`
期望：**只找到** `'use client';` 之前没有 html 关键字，**没有** `<html` 和 `</html>` 标签。更准确的验证：

```bash
cd D:/Projects/盘研智选/frontend
grep -c "<html" src/components/AuthProvider.tsx || true
grep -c "<body" src/components/AuthProvider.tsx || true
```
期望输出：`0` 和 `0`（表示文件中不存在 `<html` 和 `<body` 标签）。

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
