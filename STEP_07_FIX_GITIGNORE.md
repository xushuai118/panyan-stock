# STEP_07_FIX — 修正 .gitignore 排除 frontend/node_modules 和 .next

## ⚠️ 执行守则
1. **只改本步骤指定的文件和内容**，不准做任何额外修改
2. 每步做完跑验证命令确认
3. **做完 STOP，等锐策 review，不准做下一步**

---

## 问题说明

`.gitignore` 当前使用 `/node_modules`、`/.next/` 等以 `/` 开头的模式，只匹配根目录下的这些文件夹，不匹配 `frontend/node_modules` 和 `frontend/.next`。导致 `git add -A` 试图把前端所有依赖和构建缓存都加进去，超时失败。

---

## 影响文件

`D:\Projects\盘研智选\.gitignore`

---

## 精确改动

### 改点 — 替换 .gitignore 中的相关行

**旧代码（第 2-3 行）：**
```
/node_modules
/.pnp
```

**新代码：**
```
node_modules/
/.pnp
```

**旧代码（第 10-11 行）：**
```
/.next/
/out/
```

**新代码：**
```
.next/
out/
```

**旧代码（第 14 行）：**
```
/build
```

**新代码：**
```
build/
```

---

## 修复后的 .gitignore（完整文件）

```
# dependencies
node_modules/
/.pnp
.pnp.js

# testing
coverage/

# next.js
.next/
out/

# production
build/

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# Python
__pycache__/
*.py[cod]
*.class
*.so
.Python
env/
venv/
ENV/
*.egg-info/
.pytest_cache/
.coverage

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

✅ **验证：**
```bash
cd D:/Projects/盘研智选
grep -n "node_modules/" .gitignore
```
期望输出：一行 `node_modules/`

```bash
grep -n "^/.next/" .gitignore
```
期望：没有输出（表示没有以 `/.next/` 开头的行）

---

## 清理 git 缓存后重新推送

修复 .gitignore 后，执行以下命令：

```bash
cd D:/Projects/盘研智选

# 清除 git 索引（不包括文件本身）
git rm -r --cached .

# 按新的 .gitignore 重新添加
git add -A

# 重新提交
git commit -m "fix: .gitignore 排除 frontend/node_modules 和 .next"

# 推送
git push -u origin main
```

✅ **验证：**
```bash
git log --oneline -1
```
期望输出：一条 commit 记录

```bash
git remote -v
```
期望输出：origin 指向 GitHub 仓库

```bash
git push -u origin main
```
期望输出：推送成功

---

## ⏸️ STOP

修复 + 推送成功后停止，等锐策 review。
