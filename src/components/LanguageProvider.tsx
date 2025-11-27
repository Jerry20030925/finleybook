'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type Language = 'en' | 'zh' // English first as default

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

// Translation keys and values
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & General
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.budget': 'Budget',
    'nav.goals': 'Goals',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.subscription': 'Subscription',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'nav.terms': 'Terms',
    'nav.privacy': 'Privacy',
    'nav.signOut': 'Sign Out',

    // Dashboard
    'dashboard.title': 'Financial Overview',
    'dashboard.date': '{date}',
    'dashboard.totalAssets': 'Total Assets',
    'dashboard.monthlyIncome': 'Monthly Income',
    'dashboard.monthlyExpenses': 'Monthly Expenses',
    'dashboard.savingsRate': 'Savings Rate',
    'dashboard.cumulativeNetAssets': 'Cumulative Net Assets',
    'dashboard.monthlyTotalIncome': 'Monthly Total Income',
    'dashboard.monthlyTotalExpenses': 'Monthly Total Expenses',
    'dashboard.monthlySavingsRatio': 'Monthly Savings Ratio',

    // Recent Transactions
    'transactions.recent': 'Recent Transactions',
    'transactions.addTransaction': 'Add Transaction',
    'transactions.noRecords': 'No transaction records',
    'transactions.startAdding': 'Start adding your first transaction',
    'transactions.showMore': 'View more transactions',
    'transactions.showLess': 'Show recent 10',

    // Transaction Modal
    'transaction.add': 'Add Transaction Record',
    'transaction.type': 'Transaction Type',
    'transaction.income': '💰 Income',
    'transaction.expense': '💸 Expense',
    'transaction.amount': 'Amount *',
    'transaction.category': 'Category *',
    'transaction.selectCategory': 'Select category',
    'transaction.description': 'Description *',
    'transaction.descriptionPlaceholder': 'Transaction description',
    'transaction.date': 'Date',
    'transaction.paymentMethod': 'Payment Method',
    'transaction.cancel': 'Cancel',
    'transaction.submit': 'Add Transaction',
    'transaction.submitting': 'Adding...',
    'transaction.success': 'Transaction Added Successfully!',
    'transaction.successMessage': 'Transaction record added successfully',
    'transaction.error': 'Failed to add transaction record',

    // Payment Methods
    'payment.cash': 'Cash',
    'payment.bankCard': 'Bank Card',
    'payment.alipay': 'Alipay',
    'payment.wechat': 'WeChat Pay',
    'payment.creditCard': 'Credit Card',
    'payment.other': 'Other',

    // Categories - Income
    'category.salary': 'Salary Income',
    'category.investment': 'Investment Returns',
    'category.parttime': 'Part-time Income',
    'category.otherIncome': 'Other Income',

    // Categories - Expense
    'category.food': 'Food & Dining',
    'category.transport': 'Transportation',
    'category.shopping': 'Shopping',
    'category.housing': 'Housing & Utilities',
    'category.health': 'Health & Medical',
    'category.entertainment': 'Entertainment',
    'category.education': 'Education',
    'category.otherExpense': 'Other Expenses',

    // Quick Actions
    'quickActions.title': 'Quick Actions',
    'quickActions.manual': 'Manual Entry',
    'quickActions.receipt': 'Upload Receipt',
    'quickActions.voice': 'Voice Input',
    'quickActions.camera': 'Camera',
    'quickActions.viewAll': 'View All',

    // Auth
    'auth.welcomeBack': 'Welcome Back',
    'auth.createAccount': 'Create Account',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.signInDescription': 'Sign in to continue using your smart financial assistant',
    'auth.signUpDescription': 'Start your smart financial management journey',
    'auth.googleSignIn': 'Continue with Google',
    'auth.continueEmail': 'Continue with Email',
    'auth.signup': 'Sign Up',
    'auth.login': 'Login',
    'auth.haveAccount': 'Already have an account?',
    'auth.noAccount': 'No account?',
    'auth.or': 'OR',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.emailPlaceholder': 'Enter your email',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.passwordSignUpPlaceholder': 'At least 6 characters',
    'auth.confirmPasswordPlaceholder': 'Enter password again',
    'auth.processing': 'Processing...',
    'auth.signInSuccess': 'Sign in successful!',
    'auth.signUpSuccess': 'Sign up successful!',
    'auth.googleSignInSuccess': 'Google sign in successful!',
    'auth.signInError': 'Sign in failed, please check email and password',
    'auth.signUpError': 'Sign up failed, please try again later',
    'auth.googleSignInError': 'Google sign in failed',

    // Form Validation
    'validation.emailRequired': 'Please enter email address',
    'validation.emailInvalid': 'Please enter a valid email address',
    'validation.passwordRequired': 'Please enter password',
    'validation.passwordTooShort': 'Password must be at least 6 characters',
    'validation.confirmPasswordRequired': 'Please confirm password',
    'validation.passwordMismatch': 'Passwords do not match',
    'validation.amountRequired': 'Please enter a valid amount',
    'validation.categoryRequired': 'Please select transaction category',
    'validation.descriptionRequired': 'Please enter transaction description',
    'validation.dateRequired': 'Please select transaction date',

    // Landing Page
    'landing.title': 'Smart Financial Management with AI',
    'landing.subtitle': 'Take control of your finances with intelligent insights, automated tracking, and personalized recommendations',
    'landing.getStarted': 'Get Started Free',
    'landing.learnMore': 'Learn More',
    'landing.features.tracking': 'Smart Tracking',
    'landing.features.insights': 'AI Insights',
    'landing.features.budgeting': 'Smart Budgeting',
    'landing.features.security': 'Bank-Level Security',

    // New Landing Page (Financial Navigator)
    'landing.badge': 'Money Management, Gamified',
    'landing.hero.title.prefix': 'Your Money is a Game. ',
    'landing.hero.title.highlight': 'Stop Losing.',
    'landing.hero.desc': 'Forget boring spreadsheets. Simply drag, drop, and watch your savings grow. See exactly what you can spend today without going broke.',
    'landing.cta.start': 'Start Wealth Checkup',
    'landing.hero.sub': 'No bank connection needed · 30s setup',
    'landing.feature.safe.title': 'Safe-to-Spend',
    'landing.feature.safe.desc': 'Know exactly how much you can spend today. Green means safe, red means stop.',
    'landing.feature.drag.title': 'Drag-to-Track',
    'landing.feature.drag.desc': 'Track expenses like a game. Drag icons to the ring, crunch, done.',
    'landing.feature.time.title': 'Time Machine',
    'landing.feature.time.desc': 'See your future wealth based on current habits. Will you be rich or broke?',



    // Onboarding
    'onboarding.identity.title': 'Which state describes you best?',
    'onboarding.identity.survival.title': 'Survival Mode',
    'onboarding.identity.survival.desc': 'Living paycheck to paycheck',
    'onboarding.identity.shopaholic.title': 'Shopaholic',
    'onboarding.identity.shopaholic.desc': 'Can\'t stop spending',
    'onboarding.identity.saver.title': 'Goal Saver',
    'onboarding.identity.saver.desc': 'Saving for a dream',
    'onboarding.pain.title': 'Be honest...',
    'onboarding.pain.desc': 'How much money vanishes each month?',
    'onboarding.pain.min': '$50 (Peanuts)',
    'onboarding.pain.max': '$500+ (Help!)',
    'onboarding.pain.annual': 'That\'s an annual loss of',
    'onboarding.pain.next': 'Next',
    'onboarding.dream.title': 'If we could recover this...',
    'onboarding.dream.desc': 'By next year, you could have:',
    'onboarding.dream.ipad': 'An iPad Air',
    'onboarding.dream.flight': 'A Round-trip Flight',
    'onboarding.dream.rent': '3 Months of Rent',
    'onboarding.dream.value': 'Value approx. ${amount}',
    'onboarding.dream.cta': 'Take me to find this money',
    'onboarding.final.title': 'Last Step',
    'onboarding.final.desc': 'One second to open your "Flight Fund".',
    'onboarding.final.google': 'Start with Google',
    'onboarding.final.terms': 'By clicking, you agree to our Terms',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.currency': 'Currency',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.account': 'Account',
    'settings.support': 'Support',
    'settings.about': 'About',

    // Language Settings
    'language.title': 'Language Settings',
    'language.description': 'Choose your preferred language for the interface',
    'language.english': 'English',
    'language.chinese': '简体中文 (Chinese)',
    'language.current': 'Current Language',
    'language.save': 'Save Changes',
    'language.saved': 'Language preference saved',

    // Landing Page Legacy (for backward compatibility)
    'nav.login': 'Log In',
    'nav.register': 'Sign Up',
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'hero.title_prefix': 'AI-Driven',
    'hero.title_highlight': 'Personal Finance',
    'hero.title_suffix': 'Platform',
    'hero.description': 'An AI financial assistant integrating smart bookkeeping, financial analysis, and tax management. Making complex financial management simple and smart, helping you achieve financial freedom.',
    'hero.start': 'Get Started',
    'hero.learn_more': 'Learn More',
    'features.title': 'Smart Financial Management',
    'features.subtitle': 'Core Features',
    'features.description': 'Centering on data aggregation, smart analysis, risk warning, and personalized services, providing deep value beyond traditional bookkeeping software.',
    'features.items.aggregation.title': 'Smart Data Aggregation',
    'features.items.aggregation.desc': 'Automatically aggregate bank accounts and payment platform data, OCR receipt recognition, supporting natural language bookkeeping.',
    'features.items.analysis.title': 'Smart Analysis & Prediction',
    'features.items.analysis.desc': 'AI-based personalized financial analysis, cash flow forecasting, and smart budget suggestions.',
    'features.items.tax.title': 'Tax Risk Warning',
    'features.items.tax.desc': 'Real-time monitoring of tax compliance risks, invoice verification, duplicate reimbursement detection, and policy change alerts.',
    'features.items.ai.title': 'AI Smart Assistant',
    'features.items.ai.desc': '24/7 AI financial assistant, query financial data via natural language, and get professional advice.',
    'cta.title': 'Start Your AI Financial Journey',
    'cta.description': 'Sign up now to experience the convenience and peace of mind of intelligent financial management.',
    'cta.button': 'Start for Free',
    'cta.contact': 'Contact Us',
    'footer.copyright': '© 2025 FinleyBook. All rights reserved.',
    'footer.slogan': 'Smart financial management, making finance simple.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    'footer.about': 'About Us',
    'countries.CN': 'China',
    'countries.US': 'United States',
    'countries.AU': 'Australia',
    'countries.GB': 'United Kingdom',
    'countries.JP': 'Japan',
    'countries.CA': 'Canada',
    'countries.EU': 'Europe',

    // Goals
    'goals.title': 'Goal Management',
    'goals.description': 'Set and track your financial goals',
    'goals.totalGoals': 'Total Goals',
    'goals.inProgress': 'In Progress',
    'goals.completed': 'Completed',
    'goals.completionRate': 'Completion Rate',
    'goals.addGoal': 'Add Goal',
    'goals.activeGoals': 'Active Goals',
    'goals.completedGoals': 'Completed Goals',
    'goals.addModal.title': 'Add Goal',
    'goals.editModal.title': 'Edit Goal',
    'goals.name': 'Goal Name',
    'goals.namePlaceholder': 'e.g.: Emergency Fund',
    'goals.descriptionLabel': 'Description (Optional)',
    'goals.descriptionPlaceholder': 'Detailed description of the goal',
    'goals.targetAmount': 'Target Amount',
    'goals.deadline': 'Deadline',
    'goals.category': 'Category',
    'goals.categories.savings': 'Savings Goal',
    'goals.categories.investment': 'Investment Goal',
    'goals.categories.purchase': 'Purchase Goal',
    'goals.categories.debt': 'Debt Repayment',
    'goals.categories.emergency': 'Emergency Fund',
    'goals.update': 'Update',
    'goals.add': 'Add',
    'goals.updateProgress': 'Update Progress',
    'goals.addAmount': 'Add Amount',
    'goals.currentProgress': 'Current progress',
    'goals.daysLeft': 'days left',
    'goals.expired': 'Expired',
    'goals.completedText': 'completed',
    'goals.need': 'Need',
    'goals.congratulations': '🎉 Congratulations! Goal completed!',
    'goals.progressUpdated': 'Progress updated successfully',
    'goals.goalAdded': 'Goal added successfully',
    'goals.goalUpdated': 'Goal updated successfully',
    'goals.goalDeleted': 'Goal deleted successfully',
    'goals.loadError': 'Failed to load goals',
    'goals.fillRequired': 'Please fill in required information',
    'goals.validAmount': 'Please enter a valid amount',

    // Budget
    'budget.title': 'Budget Management',
    'budget.description': 'Set and manage your monthly budget',
    'budget.totalBudget': 'Total Budget',
    'budget.spent': 'Spent',
    'budget.remainingBudget': 'Remaining Budget',
    'budget.addBudget': 'Add Budget',
    'budget.category': 'Category',
    'budget.selectCategory': 'Select category',
    'budget.budgetAmount': 'Budget Amount',
    'budget.period': 'Period',
    'budget.monthly': 'Monthly',
    'budget.yearly': 'Yearly',
    'budget.spentAmount': 'Spent ¥{amount}',
    'budget.budgetLimit': 'Budget ¥{amount}',
    'budget.usedPercentage': '% used',
    'budget.remaining': 'Remaining: ',
    'budget.addSuccess': 'Budget added successfully',
    'budget.updateSuccess': 'Budget updated successfully',
    'budget.deleteSuccess': 'Budget deleted successfully',
    'budget.fillComplete': 'Please fill in complete information',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.all': 'All',
    'common.income': 'Income',
    'common.expense': 'Expense',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.today': 'Today',
    'common.yesterday': 'Yesterday',
    'common.thisWeek': 'This Week',
    'common.thisMonth': 'This Month',
    'common.thisYear': 'This Year'
  },
  zh: {
    // Navigation & General
    'nav.dashboard': '财务概览',
    'nav.transactions': '交易记录',
    'nav.budget': '预算管理',
    'nav.goals': '理财目标',
    'nav.reports': '报表分析',
    'nav.settings': '设置',
    'nav.profile': '个人资料',
    'nav.subscription': '订阅管理',
    'nav.about': '关于我们',
    'nav.blog': '博客',
    'nav.terms': '服务条款',
    'nav.privacy': '隐私政策',
    'nav.signOut': '退出登录',

    // Dashboard
    'dashboard.title': '财务概览',
    'dashboard.date': '{date}',
    'dashboard.totalAssets': '总资产',
    'dashboard.monthlyIncome': '本月收入',
    'dashboard.monthlyExpenses': '本月支出',
    'dashboard.savingsRate': '储蓄率',
    'dashboard.cumulativeNetAssets': '累计净资产',
    'dashboard.monthlyTotalIncome': '本月总收入',
    'dashboard.monthlyTotalExpenses': '本月总支出',
    'dashboard.monthlySavingsRatio': '本月储蓄占比',

    // Recent Transactions
    'transactions.recent': '最近交易',
    'transactions.addTransaction': '添加交易',
    'transactions.noRecords': '暂无交易记录',
    'transactions.startAdding': '开始添加您的第一笔交易',
    'transactions.showMore': '查看更多交易',
    'transactions.showLess': '显示最近10条',

    // Transaction Modal
    'transaction.add': '添加交易记录',
    'transaction.type': '交易类型',
    'transaction.income': '💰 收入',
    'transaction.expense': '💸 支出',
    'transaction.amount': '金额 *',
    'transaction.category': '分类 *',
    'transaction.selectCategory': '选择分类',
    'transaction.description': '描述 *',
    'transaction.descriptionPlaceholder': '交易描述',
    'transaction.date': '日期',
    'transaction.paymentMethod': '支付方式',
    'transaction.cancel': '取消',
    'transaction.submit': '添加交易',
    'transaction.submitting': '添加中...',
    'transaction.success': '交易添加成功！',
    'transaction.successMessage': '交易记录添加成功',
    'transaction.error': '添加交易记录失败',

    // Payment Methods
    'payment.cash': '现金',
    'payment.bankCard': '银行卡',
    'payment.alipay': '支付宝',
    'payment.wechat': '微信支付',
    'payment.creditCard': '信用卡',
    'payment.other': '其他',

    // Categories - Income
    'category.salary': '工资收入',
    'category.investment': '投资收益',
    'category.parttime': '兼职收入',
    'category.otherIncome': '其他收入',

    // Categories - Expense
    'category.food': '餐饮美食',
    'category.transport': '交通出行',
    'category.shopping': '购物消费',
    'category.housing': '居住缴费',
    'category.health': '医疗健康',
    'category.entertainment': '文化娱乐',
    'category.education': '学习教育',
    'category.otherExpense': '其他支出',

    // Quick Actions
    'quickActions.title': '快速操作',
    'quickActions.manual': '手动记账',
    'quickActions.receipt': '上传小票',
    'quickActions.voice': '语音输入',
    'quickActions.camera': '拍照记账',
    'quickActions.viewAll': '查看全部',

    // Auth
    'auth.welcomeBack': '欢迎回来',
    'auth.createAccount': '创建账户',
    'auth.signIn': '登录',
    'auth.signUp': '注册',
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.signInDescription': '登录以继续使用您的智能财务助手',
    'auth.signUpDescription': '开始您的智能财务管理之旅',
    'auth.googleSignIn': '使用 Google 登录',
    'auth.continueEmail': '使用邮箱继续',
    'auth.signup': '注册',
    'auth.login': '登录',
    'auth.haveAccount': '已有账号？',
    'auth.noAccount': '没有账号？',
    'auth.or': '或',
    'auth.forgotPassword': '忘记密码？',
    'auth.emailPlaceholder': '请输入您的邮箱',
    'auth.passwordPlaceholder': '请输入密码',
    'auth.passwordSignUpPlaceholder': '至少6位字符',
    'auth.confirmPasswordPlaceholder': '请再次输入密码',
    'auth.processing': '处理中...',
    'auth.signInSuccess': '登录成功!',
    'auth.signUpSuccess': '注册成功!',
    'auth.googleSignInSuccess': 'Google登录成功!',
    'auth.signInError': '登录失败，请检查邮箱和密码',
    'auth.signUpError': '注册失败，请稍后重试',
    'auth.googleSignInError': 'Google登录失败',

    // Form Validation
    'validation.emailRequired': '请输入邮箱地址',
    'validation.emailInvalid': '请输入有效的邮箱地址',
    'validation.passwordRequired': '请输入密码',
    'validation.passwordTooShort': '密码至少需要6位字符',
    'validation.confirmPasswordRequired': '请确认密码',
    'validation.passwordMismatch': '两次输入的密码不一致',
    'validation.amountRequired': '请输入有效的金额',
    'validation.categoryRequired': '请选择交易分类',
    'validation.descriptionRequired': '请输入交易描述',
    'validation.dateRequired': '请选择交易日期',

    // Landing Page
    'landing.title': 'AI智能财务管理',
    'landing.subtitle': '通过智能洞察、自动追踪和个性化建议，掌控您的财务状况',
    'landing.getStarted': '免费开始',
    'landing.learnMore': '了解更多',
    'landing.features.tracking': '智能追踪',
    'landing.features.insights': 'AI洞察',
    'landing.features.budgeting': '智能预算',
    'landing.features.security': '银行级安全',

    // New Landing Page (Financial Navigator)
    'landing.badge': '理财，游戏化',
    'landing.hero.title.prefix': '金钱是一场游戏，',
    'landing.hero.title.highlight': '别再输了。',
    'landing.hero.desc': '忘掉枯燥的表格。只需拖拽，看着存款增长。一眼看清今天还能花多少钱，告别月光。',
    'landing.cta.start': '开启财富体检',
    'landing.hero.sub': '无需绑定银行卡 · 30秒上手',
    'landing.feature.safe.title': '今日可花 (Safe-to-Spend)',
    'landing.feature.safe.desc': '一眼看懂今天还能花多少钱。绿色安全，红色警示。',
    'landing.feature.drag.title': '极简拖拽记账',
    'landing.feature.drag.desc': '像玩游戏一样记账。拖动图标到圆环，咔嚓一声，记账完成。',
    'landing.feature.time.title': '时光机预测',
    'landing.feature.time.desc': '看看现在的消费习惯，会让你在 5 年后成为富翁还是穷光蛋。',

    // Onboarding
    'onboarding.identity.title': '目前的财务状态？',
    'onboarding.identity.survival.title': '月光族生存模式',
    'onboarding.identity.survival.desc': '工资刚到账就没了',
    'onboarding.identity.shopaholic.title': '这就去买买买',
    'onboarding.identity.shopaholic.desc': '控制不住剁手',
    'onboarding.identity.saver.title': '正在存钱买大件',
    'onboarding.identity.saver.desc': '为了梦想而奋斗',
    'onboarding.pain.title': '说实话...',
    'onboarding.pain.desc': '你觉得每个月有多少钱是“不知道花哪去了”？',
    'onboarding.pain.min': '$50 (小意思)',
    'onboarding.pain.max': '$500+ (救命!)',
    'onboarding.pain.annual': '这相当于你每年扔掉了',
    'onboarding.pain.next': '下一步',
    'onboarding.dream.title': '如果我们能帮你找回这笔钱...',
    'onboarding.dream.desc': '明年这个时候，你可以拥有：',
    'onboarding.dream.ipad': '一台 iPad Air',
    'onboarding.dream.flight': '一张回国往返机票',
    'onboarding.dream.rent': '三个月的房租',
    'onboarding.dream.value': '价值约 ${amount}',
    'onboarding.dream.cta': '带我去找回这笔钱',
    'onboarding.final.title': '最后一步',
    'onboarding.final.desc': '只需一秒，开启你的“机票基金”账户。',
    'onboarding.final.google': '使用 Google 开启',
    'onboarding.final.terms': '点击即代表同意我们的服务条款',

    // Settings
    'settings.title': '设置',
    'settings.language': '语言',
    'settings.currency': '货币',
    'settings.notifications': '通知',
    'settings.privacy': '隐私',
    'settings.account': '账户',
    'settings.support': '支持',
    'settings.about': '关于',

    // Language Settings
    'language.title': '语言设置',
    'language.description': '选择您首选的界面语言',
    'language.english': 'English (英语)',
    'language.chinese': '简体中文',
    'language.current': '当前语言',
    'language.save': '保存更改',
    'language.saved': '语言偏好已保存',

    // Landing Page Legacy (for backward compatibility)
    'nav.login': '登录',
    'nav.register': '免费注册',
    'nav.features': '功能',
    'nav.pricing': '价格',
    'hero.title_prefix': 'AI驱动的',
    'hero.title_highlight': '个人财务',
    'hero.title_suffix': '管理平台',
    'hero.description': '集智能记账、财务分析、税务管理于一体的AI财务助手。让复杂的财务管理变得简单智能，助您实现财务自由。',
    'hero.start': '开始使用',
    'hero.learn_more': '了解更多',
    'features.title': '智能财务管理',
    'features.subtitle': '核心功能矩阵',
    'features.description': '围绕"数据归集、智能分析、风险预警、个性化服务"四大主线，提供超越传统记账软件的深度价值。',
    'features.items.aggregation.title': '智能数据归集',
    'features.items.aggregation.desc': '自动聚合银行账户、支付平台数据，OCR识别票据信息，支持自然语言记账',
    'features.items.analysis.title': '智能分析预测',
    'features.items.analysis.desc': '基于AI的个性化财务分析，现金流预测，智能预算建议',
    'features.items.tax.title': '税务风险预警',
    'features.items.tax.desc': '实时监测税务合规风险，发票验真，重复报销检测，政策变动提醒',
    'features.items.ai.title': 'AI智能问答',
    'features.items.ai.desc': '24/7 AI财务助手，自然语言查询财务数据，获取专业建议',
    'cta.title': '开启您的AI财务管理之旅',
    'cta.description': '立即注册，体验智能化财务管理带来的便捷与安心。',
    'cta.button': '免费开始',
    'cta.contact': '联系我们',
    'footer.copyright': '© 2025 FinleyBook. 保留所有权利。',
    'footer.slogan': '智能财务管理，让理财更简单',
    'footer.privacy': '隐私政策',
    'footer.terms': '使用条款',
    'footer.about': '关于我们',
    'countries.CN': '中国',
    'countries.US': '美国',
    'countries.AU': '澳大利亚',
    'countries.GB': '英国',
    'countries.JP': '日本',
    'countries.CA': '加拿大',
    'countries.EU': '欧洲',

    // Goals
    'goals.title': '目标管理',
    'goals.description': '设定并追踪您的财务目标',
    'goals.totalGoals': '总目标',
    'goals.inProgress': '进行中',
    'goals.completed': '已完成',
    'goals.completionRate': '完成率',
    'goals.addGoal': '添加目标',
    'goals.activeGoals': '进行中的目标',
    'goals.completedGoals': '已完成的目标',
    'goals.addModal.title': '添加目标',
    'goals.editModal.title': '编辑目标',
    'goals.name': '目标名称',
    'goals.namePlaceholder': '例如：紧急基金',
    'goals.descriptionLabel': '描述（可选）',
    'goals.descriptionPlaceholder': '目标的详细描述',
    'goals.targetAmount': '目标金额',
    'goals.deadline': '截止日期',
    'goals.category': '分类',
    'goals.categories.savings': '储蓄目标',
    'goals.categories.investment': '投资目标',
    'goals.categories.purchase': '购买目标',
    'goals.categories.debt': '债务清偿',
    'goals.categories.emergency': '应急基金',
    'goals.update': '更新',
    'goals.add': '添加',
    'goals.updateProgress': '更新进度',
    'goals.addAmount': '增加金额',
    'goals.currentProgress': '当前进度',
    'goals.daysLeft': '天后到期',
    'goals.expired': '已过期',
    'goals.completedText': '完成',
    'goals.need': '还需',
    'goals.congratulations': '🎉 恭喜！目标已完成！',
    'goals.progressUpdated': '进度更新成功',
    'goals.goalAdded': '目标添加成功',
    'goals.goalUpdated': '目标更新成功',
    'goals.goalDeleted': '目标删除成功',
    'goals.loadError': '加载目标失败',
    'goals.fillRequired': '请填写必要信息',
    'goals.validAmount': '请输入有效金额',

    // Budget
    'budget.title': '预算管理',
    'budget.description': '设置和管理您的月度预算',
    'budget.totalBudget': '总预算',
    'budget.spent': '已花费',
    'budget.remainingBudget': '剩余预算',
    'budget.addBudget': '添加预算',
    'budget.category': '分类',
    'budget.selectCategory': '选择分类',
    'budget.budgetAmount': '预算金额',
    'budget.period': '周期',
    'budget.monthly': '月度',
    'budget.yearly': '年度',
    'budget.spentAmount': '已花费 ¥{amount}',
    'budget.budgetLimit': '预算 ¥{amount}',
    'budget.usedPercentage': '% 已使用',
    'budget.remaining': '剩余: ',
    'budget.addSuccess': '预算添加成功',
    'budget.updateSuccess': '预算更新成功',
    'budget.deleteSuccess': '预算删除成功',
    'budget.fillComplete': '请填写完整信息',

    // Common
    'common.save': '保存',
    'common.cancel': '取消',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.confirm': '确认',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.close': '关闭',
    'common.back': '返回',
    'common.next': '下一步',
    'common.previous': '上一步',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.sort': '排序',
    'common.all': '全部',
    'common.income': '收入',
    'common.expense': '支出',
    'common.yes': '是',
    'common.no': '否',
    'common.today': '今天',
    'common.yesterday': '昨天',
    'common.thisWeek': '本周',
    'common.thisMonth': '本月',
    'common.thisYear': '今年'
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en') // Default to English

  // Load saved language preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('finleybook-language') as Language
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
        setLanguage(savedLanguage)
      }
    }
  }, [])

  // Save language preference when changed
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('finleybook-language', lang)
    }
  }

  // Translation function with parameter support
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key] || key

    // Replace parameters if provided
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, String(params[param]))
      })
    }

    return translation
  }

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
