# 记忆画廊 - Cinematic Memory Gallery

一个沉浸式电影感摄影作品集网页。

## 在线预览

部署后在此替换为你的 GitHub Pages 链接。

## 部署到 GitHub Pages

### 方式一：推送代码自动部署（推荐）

```bash
# 1. 在 GitHub 上新建一个空仓库

# 2. 在项目目录下运行：
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main

# 3. 在 GitHub 仓库页面：
#    Settings → Pages → Source 选 "GitHub Actions"
#    推送后 Actions 会自动构建并部署
```

### 方式二：手动上传 dist 文件夹

1. 构建项目：`npm run build`
2. 打开你的 GitHub 仓库
3. 点击 **Add file → Upload files**
4. 将 `dist/` 文件夹里的所有文件拖拽上传
5. 提交到 `main` 分支
6. 仓库 Settings → Pages → Branch 选 `main`，文件夹选 `/ (root)` → Save

### 本地开发

```bash
npm install
npm run dev     # 本地预览 http://localhost:5173
npm run build   # 构建生产版本到 dist/
```
