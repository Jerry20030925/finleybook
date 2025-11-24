# 🌐 FinleyBook 访问指南

## ✅ 开发服务器已启动成功！

### 📱 访问地址 (多种选择)

1. **主要地址**: http://localhost:3001
2. **备用地址**: http://127.0.0.1:3001 
3. **网络地址**: http://0.0.0.0:3001

### 🔧 如果仍然无法访问：

#### 方法1: 尝试其他端口
```bash
npm run dev:3000   # 使用端口3000
npm run dev:3002   # 使用端口3002
```

#### 方法2: 检查防火墙
- 确保防火墙允许localhost访问
- 尝试临时关闭防火墙测试

#### 方法3: 使用不同的浏览器
- Chrome: http://localhost:3001
- Firefox: http://localhost:3001  
- Safari: http://localhost:3001
- Edge: http://localhost:3001

#### 方法4: 清除浏览器缓存
- 硬刷新: Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows)
- 无痕模式测试

#### 方法5: 检查hosts文件
确保 `/etc/hosts` 文件包含:
```
127.0.0.1    localhost
```

### 🚀 成功访问后您将看到：

- **FinleyBook Logo** 
- **现代化中文界面**
- **用户注册/登录页面**
- **智能财务管理功能**

### 📊 主要功能：

1. **智能记账** - OCR票据识别、语音输入
2. **财务分析** - AI驱动的个性化洞察
3. **预算管理** - 智能预算建议和跟踪
4. **税务管理** - 合规检查和风险预警
5. **目标追踪** - 财务目标设定和进度监控

### 💡 开发提示

如果遇到问题，请检查终端输出是否有错误信息，或者尝试：

```bash
# 重新安装依赖
npm install

# 清除Next.js缓存
rm -rf .next

# 重新启动
npm run dev
```

---

**🎉 欢迎使用 FinleyBook - 让财务管理更智能！**