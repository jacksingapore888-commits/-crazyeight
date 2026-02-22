# Tina 疯狂 8 点 (Crazy Eights)

这是一个使用 React、Tailwind CSS 和 Motion 开发的高性能纸牌游戏。

## 部署到 Vercel 指南

由于我是一个 AI 助手，无法直接访问您的 GitHub 或 Vercel 账户，请按照以下步骤手动完成部署：

### 1. 同步到 GitHub

1. 在 GitHub 上创建一个新的仓库（例如 `tina-crazy-8s`）。
2. 在本地终端中运行以下命令（假设您已经安装了 Git）：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/您的用户名/tina-crazy-8s.git
   git push -u origin main
   ```

### 2. 部署到 Vercel

1. 登录 [Vercel 控制台](https://vercel.com/)。
2. 点击 **"Add New"** -> **"Project"**。
3. 导入您刚刚创建的 GitHub 仓库。
4. 在 **Environment Variables** (环境变量) 部分，添加以下变量：
   - `GEMINI_API_KEY`: 您的 Google AI SDK 密钥（如果游戏中使用了 AI 功能）。
5. 点击 **"Deploy"**。

### 3. 项目配置说明

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 本地开发

如果您想在本地运行此项目：

1. 克隆仓库。
2. 运行 `npm install` 安装依赖。
3. 运行 `npm run dev` 启动开发服务器。
4. 访问 `http://localhost:3000`。

## 技术栈

- **框架**: React 19
- **样式**: Tailwind CSS 4
- **动画**: Motion (framer-motion)
- **图标**: Lucide React
