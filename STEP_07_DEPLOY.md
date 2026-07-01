# STEP_07_DEPLOY — 清理 git 对象 + 推送 + Vercel 部署

## ⚠️ 执行守则
1. **只做本步骤指定的事**，不准做任何额外修改
2. 每步做完跑验证命令确认
3. **做完 STOP，等锐策 review，不准做下一步**

---

## 背景

当前 `.git` 目录中残留了 12744 个从之前错误的 `git add -A` 留下的孤儿对象，导致推送卡住。解决方案：**删掉 .git，重新初始化，提交，推送**。

---

## 精确操作

### Step A — 删除旧的 .git 目录（删除前确认路径正确）

```bash
rm -rf /d/Projects/盘研智选/.git
```

✅ **验证：** `ls /d/Projects/盘研智选/.git 2>&1 || echo "已删除"`
期望输出：`已删除`

---

### Step B — 重新初始化 git

```bash
cd /d/Projects/盘研智选
git init
git add -A
git commit -m "feat: 盘研智选 MVP Phase 1 - 智能A股筛选平台"
```

✅ **验证：** `git log --oneline -1`
期望输出：一条 commit 记录（此时只有 ~30 个文件，没有 node_modules）

---

### Step C — 推送到 GitHub

```bash
cd /d/Projects/盘研智选
# 注意：用你收到的 Token 替换 YOUR_TOKEN
git remote add origin https://shuaixu16-dotcom:YOUR_TOKEN@github.com/shuaixu16-dotcom/panyan-stock.git
git branch -M main
git push -u origin main --force
```

注意：`--force` 是必要的，因为 GitHub 上已有之前的空仓库状态。

✅ **验证：** `git remote -v`
期望输出：origin 指向 GitHub 仓库

---

### Step D — 部署 Vercel

创建 `frontend/vercel.json`：

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

然后打开浏览器：
1. 访问 https://vercel.com/import
2. 用 GitHub 登录（选 shuaixu16-dotcom）
3. 导入 panyan-stock 仓库
4. 按下图配置：

| 配置项 | 值 |
|--------|-----|
| Framework Preset | Next.js |
| Root Directory | `frontend` |
| Build Command | `next build` |
| Output Directory | 默认（.next） |

5. 点击 **Environment Variables** → 添加：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://quqokvwotcxulupzzjdk.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_mYAeYVq1lxGlkjNhXOacVg_vTmzn8fc` |

6. 点 **Deploy** → 等 2 分钟部署完成
7. 部署成功后返回一个 URL（如 `panyan-stock.vercel.app`），打开验证

---

## ⏸️ STOP

推送成功 + Vercel 部署完成后停止，等锐策 review。
