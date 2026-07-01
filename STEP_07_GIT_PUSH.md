# STEP_07 — Git 初始化 + 推送 GitHub

## ⚠️ 执行守则
1. **只做本步骤指定的事**，不准做任何额外修改
2. 每步做完跑验证命令确认
3. **做完 STOP，等锐策 review，不准做下一步**

---

## 背景

部署到 Vercel 需要先把代码推送到 GitHub。本步骤在本地初始化 Git、创建 `.gitignore`（已有）、做首次提交、推送到远程仓库。

---

## 前置条件

麦子提供了 GitHub 仓库地址后，才能执行。暂时以 `YOUR_GITHUB_URL` 占位，麦子会给你具体的 URL。

---

## 精确操作

### 操作 A — 初始化 Git + 提交

在项目根目录执行：

```bash
cd /d/Projects/盘研智选

# 初始化 git（如果尚未）
git init

# 添加所有文件
git add -A

# 首次提交
git commit -m "feat: 盘研智选 MVP Phase 1 - 智能A股筛选平台"

# 添加远程仓库（用麦子给的 URL 替换 YOUR_GITHUB_URL）
git remote add origin https://github.com/shuaixu16-dotcom/panyan-stock.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

✅ **验证：**
```bash
cd /d/Projects/盘研智选
git log --oneline -1
```
期望输出：一条 commit 记录

```bash
git remote -v
```
期望输出：origin 指向你的 GitHub 仓库

---

## ⏸️ STOP

推送完成后停止，等锐策 review。
