# 盘研智选 — 项目记忆

> 项目级别笔记，每次会话结束时更新。

---

## 项目概要
- **位置**: `D:\Projects\盘研智选\`
- **方案**: `D:\Projects\盘研智选\CODEX_PROMPT.md`
- **技术栈**: Next.js 14 + TypeScript + Tailwind + Supabase + 东方财富免费API
- **部署**: Vercel（待完成——卡在 GitHub push 认证）
- **GitHub**: `https://github.com/shuaixu16-dotcom/panyan-stock`
- **状态**: MVP Phase 1 开发基本完成，剩余部署步骤

## 分工
- 麦子 → 提需求、定优先级、手动操作（注册/建表/创建仓库）
- 锐策 → 出方案、写 STEP、review 代码
- Codex → 按 STEP 文件机械执行代码修改

## 进度记录

### 2026-06-30 晚（20:35 ~ 00:55）— MVP Phase 1 主体完成

**已完成：**
- ✅ 项目复盘 + 工作流搭建
- ✅ STEP_02: Tailwind CSS 修复（清缓存重装依赖）
- ✅ STEP_03: Supabase 建表 + 自选股功能（首页 + 详情页）
- ✅ STEP_04: 匿名登录 AuthProvider
- ✅ STEP_04_FIX: loading 状态 HTML bug 修正
- ✅ STEP_05: 选股筛选器联调真实东方财富数据
- ✅ STEP_05_FIX: 回滚 Codex 越界重写的 JSX
- ✅ STEP_06: 清理 V1 遗留文件
- ✅ STEP_07: Git 初始化 + commit
- ⚠️ STEP_07_FIX: .gitignore 修复 + 重新 commit 通过
- ❌ git push 被 GitHub 认证拒绝（需要 Token 或 SSH）

### 策略观察
- Codex 执行准确但管不住手（STEP_05 越界），需要在 STEP 中额外注明"严禁任何额外修改"
- 锐策也会写 bug 的 STEP（AuthProvider loading 返回 html/body），必须质检兜底
- 三层过滤（STEP 自审 → Codex 执行 → 锐策质检）有效，没有漏网

## 未完成的功能 / 待续
1. ❌ git push 到 GitHub
2. ❌ Vercel 部署上线
3. ❌ 部署后验证功能完整性
