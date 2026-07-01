# STEP_02 — 修复 Tailwind CSS 不渲染（已诊断）

## ⚠️ 执行守则
1. 只改本步骤指定的内容
2. 每步做完跑验证命令
3. **做完 STOP，等锐策 review，不准做下一步**

---

## 诊断结论（已确认）

| 检查项 | 结果 | 说明 |
|--------|------|------|
| layout.tsx 导入 globals.css | ✅ | `import './globals.css'` 存在 |
| postcss.config.js | ✅ | tailwindcss + autoprefixer 插件已配置 |
| tailwind.config.js content 路径 | ✅ | 覆盖 src/pages, src/components, src/app |
| globals.css @tailwind 指令 | ✅ | base, components, utilities 齐全 |
| tailwindcss 包已安装 | ✅ | CLI 可用，package.json 有声明 |
| 自定义组件类 btn-primary/card | ✅ | globals.css 中已定义 |

**根因判断：** 配置文件全部正常，大概率是 `.next` 缓存污染或依赖版本不兼容。修复策略：**清缓存 → 重装依赖 → 重建 → 验证渲染**。

---

## 精确修复步骤

### Step A：清缓存 + 重装依赖

打开终端（PowerShell），逐条执行：

```powershell
cd D:\Projects\盘研智选\frontend

# 1. 清理 .next 缓存
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host ".next 已清理" -ForegroundColor Green

# 2. 清理 node_modules 重新安装
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
```

✅ **验证：** 运行 `npm ls tailwindcss postcss autoprefixer`
期望输出：三个包都在列表中，无 `UNMET DEPENDENCY` 错误

---

### Step B：build 验证编译通过

```powershell
cd D:\Projects\盘研智选\frontend
npm run build
```

✅ **验证：** 终端输出末尾包含 `✓ Compiled successfully` 或类似成功信息
❌ 如果有 TypeScript 或编译错误，完整截图发给锐策，**不要自行修复**

---

### Step C：启动 dev server 验证渲染

```powershell
cd D:\Projects\盘研智选\frontend
npx next dev -p 3000
```

1. 等待 terminal 显示 `ready - started server on http://localhost:3000`
2. 打开浏览器访问 `http://localhost:3000`
3. 按 F12 → **Console 面板**：检查是否有红色 CSS 加载错误或 404
4. 切换到 **Elements 面板**：检查 `<body>` 标签下页面内容是否有样式（白色背景、蓝色按钮、圆角卡片）

**预期效果：**
- ✅ 页面背景为浅灰色 `#F8FAFC`
- ✅ 顶部指数行情卡片有白色背景 + 阴影 + 圆角
- ✅ "股票搜索"按钮有蓝色背景白色文字
- ✅ 搜索输入框有边框和圆角

**如果页面仍然是裸 HTML（无样式）：**
1. 在浏览器 DevTools → Network 面板过滤 `css`，刷新页面
2. 看是否有 `.css` 文件请求，以及状态码是否为 200
3. 如果找不到 CSS 请求，或者有 404/500，截图发给锐策

---

### 验证命令

```bash
grep -c "rounded-xl" src/app/page.tsx
```
期望输出：`2` 或以上

```bash
grep -c "btn-primary" src/app/page.tsx
```
期望输出：`2` 或以上

---

## ⏸️ STOP

修复 + 验证完成后停止，等锐策 review 通过后再进入下一步。
不准做任何额外修改。
