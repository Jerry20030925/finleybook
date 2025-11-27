# FinleyBook - AI个人财务与税务管理平台

<div align="center">
  <img src="public/logo.png" alt="FinleyBook Logo" width="300"/>
  
  <p><em>集智能化、自动化与个性化于一体的AI个人财务与税务管理平台</em></p>
</div>

FinleyBook致力于为用户提供超越传统记账软件的深度价值，让财务管理变得更智能、更简单。

## 🌟 核心功能

### 📥 智能数据归集
- **多源数据接入**: 支持连接主流银行、支付平台（支付宝、微信支付）
- **智能票据识别**: 利用OCR技术自动识别票据信息
- **自然语言记账**: 支持语音和文字输入，AI自动理解并创建交易记录
- **自动化对账**: 智能匹配和分类交易，减少手动输入

### 📊 智能分析与预测
- **个性化财务分析**: 基于用户完整财务状况生成定制化报告
- **现金流预测**: 使用机器学习预测未来现金流趋势
- **智能预算建议**: 根据历史数据和财务目标提供优化建议
- **财务健康评分**: 多维度评估财务状况并提供改进建议

### ⚠️ 智能税务管理与风险预警
- **税务风险雷达**: 实时监测合规风险，包括发票验真、重复报销检测
- **政策变动提醒**: 自动跟踪税法变化并提供相关建议
- **合规检查**: 自动验证票据和交易的合规性
- **税务优化建议**: AI分析并推荐合法的税务优化策略

### 📝 个性化报告与服务
- **一键生成报告**: 支持PDF、Excel格式的专业财务报告
- **AI智能问答**: 24/7财务助手，自然语言查询财务数据
- **多端协同**: 支持PC、手机、平板无缝切换
- **个性化仪表盘**: 自定义首页展示内容

## 🚀 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **后端**: Firebase (Firestore, Auth, Storage, Functions)
- **AI/ML**: OpenAI GPT-4, Tesseract.js (OCR)
- **数据分析**: Chart.js, Recharts
- **部署**: Vercel (推荐) 或 Firebase Hosting

## 📋 快速开始

### 环境要求
- Node.js 18+
- Firebase项目
- OpenAI API密钥

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/finleybook.git
   cd finleybook
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境配置**
   ```bash
   cp .env.example .env.local
   ```
   编辑 `.env.local` 文件，填入以下配置：
   - Firebase项目配置
   - OpenAI API密钥
   - 其他可选的第三方服务密钥

4. **Firebase设置**
   - 在Firebase控制台创建新项目
   - 启用Authentication、Firestore、Storage服务
   - 配置安全规则（参考 `/firebase` 目录中的示例）

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**
   打开浏览器访问 `http://localhost:3000`

## 📁 项目结构

```
finleybook/
├── src/
│   ├── app/                 # Next.js 14 App Router
│   ├── components/          # React组件
│   │   ├── modals/         # 模态框组件
│   │   └── ...
│   ├── lib/                # 工具函数和服务
│   │   └── services/       # 业务逻辑服务
│   ├── types/              # TypeScript类型定义
│   └── hooks/              # 自定义React Hooks
├── public/                 # 静态资源
├── firebase/               # Firebase配置和规则
└── docs/                   # 文档
```

## 🔧 核心服务

### DataAggregationService
负责智能数据归集，包括银行同步、OCR识别、自然语言处理等功能。

### AIAnalyticsService
提供AI驱动的财务分析，包括支出模式分析、现金流预测、财务健康评分等。

### TaxRiskMonitoringService
税务风险监控和合规管理，包括风险评估、合规检查、优化建议等。

### OCRService
OCR票据识别服务，支持多种票据类型的智能识别和数据提取。

## 🎨 UI/UX设计理念

- **简洁直观**: 采用现代化设计语言，降低学习成本
- **智能交互**: AI驱动的交互体验，减少用户手动操作
- **响应式设计**: 完美适配桌面端、平板和手机
- **无障碍设计**: 支持键盘导航和屏幕阅读器

## 🔒 安全与隐私

- **数据加密**: 所有敏感数据采用端到端加密
- **权限控制**: 细粒度的用户权限管理
- **隐私保护**: 严格遵循数据保护法规
- **安全审计**: 定期进行安全漏洞扫描和修复

## 📈 路线图

### Phase 1 (当前版本)
- ✅ 基础记账功能
- ✅ OCR票据识别
- ✅ AI财务分析
- ✅ 税务风险监控

### Phase 2 (计划中)
- 🔄 银行API集成 (Plaid)
- 🔄 移动端应用
- 🔄 高级报表功能
- 🔄 团队协作功能

### Phase 3 (未来)
- ⏳ 投资组合管理
- ⏳ 保险管理
- ⏳ 退休规划
- ⏳ 国际化支持

## 🤝 贡献指南

我们欢迎社区贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细的贡献指南。

### 开发流程
1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与联系

- 📧 邮箱: support@finleybook.com
- 🐛 问题反馈: [GitHub Issues](https://github.com/your-username/finleybook/issues)
- 💬 讨论交流: [GitHub Discussions](https://github.com/your-username/finleybook/discussions)

## 🙏 致谢

感谢以下开源项目和服务：
- [Next.js](https://nextjs.org/) - React开发框架
- [Firebase](https://firebase.google.com/) - 后端服务
- [OpenAI](https://openai.com/) - AI服务
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Heroicons](https://heroicons.com/) - 图标库

---

**让智能财务管理触手可及** ✨# finleybook

# Last deployed: Thu Nov 27 15:40:33 AEDT 2025
