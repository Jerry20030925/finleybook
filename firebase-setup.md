# Firebase 设置指南

## 📋 Firebase CLI 设置步骤

### 1. 登录 Firebase
```bash
firebase login
```
在浏览器中登录您的 Google 账户

### 2. 初始化 Firebase 项目
```bash
firebase init
```

选择以下选项：
- ✅ Firestore: Configure security rules and indexes files
- ✅ Storage: Configure security rules file  
- ✅ Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Action deploys

### 3. 项目设置
- **选择现有项目**: finleybook-6120d
- **Firestore规则文件**: firebase/firestore.rules (已存在)
- **Firestore索引文件**: firebase/firestore.indexes.json (已存在)
- **Storage规则文件**: firebase/storage.rules (已存在)
- **公共目录**: out
- **单页应用**: Yes
- **GitHub部署**: No (暂时)

### 4. 部署规则到 Firebase
```bash
firebase deploy --only firestore:rules,storage
```

### 5. 构建和部署网站 (可选)
```bash
npm run build
npm run export  # 如果有这个脚本
firebase deploy --only hosting
```

## 🔧 Firebase 控制台设置

访问: https://console.firebase.google.com/project/finleybook-6120d

### 启用服务：

1. **Authentication**
   - 登录方法 → 启用"邮箱/密码"
   - 用户标签页中可以查看注册用户

2. **Firestore Database**
   - 创建数据库 → 选择"测试模式"或"生产模式"
   - 位置选择就近的服务器

3. **Storage**
   - 开始使用 → 选择相同位置
   - 用于存储用户上传的票据和文档

4. **Analytics** (可选)
   - 已自动启用
   - 可以查看网站访问统计

## ✅ 完成后测试

1. 访问 http://localhost:3000
2. 注册新用户账户
3. 测试各项功能：
   - 添加交易记录
   - 上传票据识别
   - 语音记账
   - 查看财务分析

## 🚀 部署到生产环境

### 使用 Vercel (推荐)
```bash
npx vercel
```

### 使用 Firebase Hosting
```bash
npm run build
firebase deploy
```