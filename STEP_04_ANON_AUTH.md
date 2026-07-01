# STEP_04 — 匿名登录（让自选股真正能用）

## ⚠️ 执行守则
1. 先读 `CODEX_PROMPT.md` 了解方案背景
2. **只改本步骤指定的文件和内容**，不准做任何额外修改
3. 每步做完跑验证命令确认
4. **做完 STOP，等锐策 review，不准做下一步**

---

## 问题背景

当前 `watchlists` 表要求 `user_id NOT NULL DEFAULT auth.uid()`，但网页没有登录功能。
所以用户点"加自选"时 Supabase 返回 `auth.uid()` = NULL，插入会报错。

**解决方案：** 页面加载时自动匿名登录 Supabase，这样 `auth.uid()` 会返回一个真实 UUID。

---

## 影响文件

`frontend/src/app/layout.tsx` — 根布局，加入一个 AuthProvider 组件

---

## 精确改动

### 改点 A — 创建 AuthProvider 组件

**新建文件：** `frontend/src/components/AuthProvider.tsx`

写入以下内容：
```tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 检查是否已有会话
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setReady(true);
        return;
      }
      // 没有会话则匿名登录
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('匿名登录失败:', error.message);
      }
      setReady(true);
    };
    init();
  }, []);

  // 匿名登录完成前不渲染子组件，避免插入自选时出错
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

  return <>{children}</>;
}
```

✅ **验证：** `grep -n "signInAnonymously\|AuthProvider" frontend/src/components/AuthProvider.tsx`
期望：找到 `signInAnonymously` 调用行

---

### 改点 B — 修改 layout.tsx 使用 AuthProvider

**影响文件：** `frontend/src/app/layout.tsx`

#### B1 — 导入 AuthProvider

在文件顶部，`import './globals.css';` 下方插入一行：
```tsx
import AuthProvider from '@/components/AuthProvider';
```

#### B2 — 在模板中包裹 children

**改前（第14-16行附近）：**
```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans bg-bg-page text-content-1">
        {children}
      </body>
    </html>
  );
}
```

**改后：**
```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans bg-bg-page text-content-1">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

✅ **验证：** `grep -n "AuthProvider" frontend/src/app/layout.tsx`
期望：找到 2 处（import + 使用）

---

## 最终验证

```bash
cd D:/Projects/盘研智选/frontend
npm run build
```
期望：编译零错误通过

---

## 额外：Supabase 控制台需启用匿名登录

告诉麦子去 Supabase 控制台打开匿名登录开关：

1. 左侧菜单 → **Authentication** → **Providers**
2. 找到 **Anonymous** → 点 **Enable**
3. 点 **Save**

---

## ⏸️ STOP

改完 + build 验证通过后停止，等锐策 review。
不准做任何额外修改。
