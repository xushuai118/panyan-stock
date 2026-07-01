# STEP_06 — 清理 V1 遗留文件

## ⚠️ 执行守则
1. **只做本步骤指定的事**，不准做任何额外修改
2. 每步做完跑验证命令确认
3. **做完 STOP，等锐策 review，不准做下一步**

---

## 背景

从 V1（Flask + Docker）迁移到 V2（Next.js + Supabase + Vercel）后，还有两个文件未清理：
- `frontend/Dockerfile` — 旧 Docker 部署配置，不再需要
- `frontend/start.bat` — 旧一键启动脚本，不再需要

---

## 精确操作

删除以下两个文件：

```bash
rm /d/Projects/盘研智选/frontend/Dockerfile
rm /d/Projects/盘研智选/frontend/start.bat
```

✅ **验证：**
```bash
ls /d/Projects/盘研智选/frontend/Dockerfile /d/Projects/盘研智选/frontend/start.bat 2>&1 || true
```
期望输出：两个文件都报 `No such file or directory`

---

## ⏸️ STOP

删完 + 验证通过后停止，等锐策 review。
不准做任何额外修改。
