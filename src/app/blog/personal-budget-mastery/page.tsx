import { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UserIcon,
  ArrowLeftIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: '个人预算管理完全指南：从入门到精通 - FinleyBook 博客',
  description: '学习如何制定有效的个人预算，掌控您的财务生活。本文详细介绍50/30/20规则、零基预算法等实用预算管理方法。',
  keywords: '个人预算, 预算管理, 50/30/20规则, 零基预算, 财务规划, 理财技巧',
  authors: [{ name: '张明' }],
  openGraph: {
    title: '个人预算管理完全指南：从入门到精通',
    description: '学习如何制定有效的个人预算，掌控您的财务生活',
    type: 'article',
    publishedTime: '2024-11-20T00:00:00.000Z',
    authors: ['张明'],
    locale: 'zh_CN',
  },
  alternates: {
    canonical: '/blog/personal-budget-mastery'
  }
}

export default function PersonalBudgetMastery() {
  const articleData = {
    slug: 'personal-budget-mastery',
    title: '个人预算管理完全指南：从入门到精通',
    excerpt: '学习如何制定有效的个人预算，掌控您的财务生活。本文将介绍50/30/20规则、零基预算法等实用方法。',
    author: '张明',
    publishedTime: '2024-11-20T00:00:00.000Z',
    modifiedTime: '2024-11-20T00:00:00.000Z',
    category: '预算规划',
    tags: ['预算管理', '个人理财', '财务规划'],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    wordCount: 2500
  }

  return (
    <>
      <StructuredData type="article" data={articleData} />
      <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            返回博客
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-12">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative h-96">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="个人预算管理"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                  预算规划
                </span>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  个人预算管理完全指南
                </h1>
                <p className="text-xl mt-4 text-gray-200">
                  从入门到精通，掌控您的财务生活
                </p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  <span>张明</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>2024年11月20日</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>8分钟阅读</span>
                </div>
                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 ml-auto">
                  <ShareIcon className="w-4 h-4" />
                  <span>分享</span>
                </button>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-600 leading-relaxed">
                  无论您是刚开始工作的新人，还是希望重新整理财务的资深人士，
                  掌握预算管理都是实现财务目标的第一步。本文将为您提供一套完整的预算管理方法，
                  帮助您从财务新手成长为预算管理专家。
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <h2>为什么预算管理如此重要？</h2>
            
            <p>
              预算管理不仅仅是记录收支那么简单，它是一个系统性的财务规划工具。
              有效的预算管理可以帮助您：
            </p>
            
            <ul>
              <li><strong>明确财务目标：</strong>清楚地了解自己的财务状况和目标</li>
              <li><strong>控制支出：</strong>避免冲动消费，确保支出在可控范围内</li>
              <li><strong>增加储蓄：</strong>为应急基金和长期目标积累资金</li>
              <li><strong>减少财务压力：</strong>通过规划减少对金钱的焦虑</li>
              <li><strong>实现财务自由：</strong>为长期的财务独立打下基础</li>
            </ul>

            <h2>50/30/20 规则：最受欢迎的预算方法</h2>
            
            <p>
              50/30/20 规则是最简单也最实用的预算管理方法之一。
              这个规则将您的税后收入分为三个部分：
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 my-8">
              <h3 className="text-blue-900 font-semibold mb-4">50/30/20 规则详解</h3>
              <ul className="space-y-3">
                <li><strong className="text-blue-800">50% - 必需品：</strong>房租/房贷、水电费、食物、交通、保险等生活必需支出</li>
                <li><strong className="text-blue-800">30% - 娱乐消费：</strong>外出就餐、娱乐、购物、旅行等非必需支出</li>
                <li><strong className="text-blue-800">20% - 储蓄与投资：</strong>应急基金、退休储蓄、投资、债务偿还</li>
              </ul>
            </div>

            <h3>如何实施 50/30/20 规则？</h3>
            
            <p>假设您的月收入为10,000元，按照50/30/20规则分配：</p>
            
            <ul>
              <li><strong>必需品 (5,000元)：</strong>房租3,000元、食物1,200元、交通500元、保险300元</li>
              <li><strong>娱乐消费 (3,000元)：</strong>外出就餐1,000元、娱乐800元、购物1,200元</li>
              <li><strong>储蓄与投资 (2,000元)：</strong>应急基金1,000元、投资1,000元</li>
            </ul>

            <h2>零基预算法：更精确的预算管理</h2>
            
            <p>
              零基预算法要求您为每一分钱都找到用途，直到收入减去所有计划支出等于零。
              这种方法更加精确，适合希望严格控制财务的人群。
            </p>
            
            <h3>零基预算的步骤：</h3>
            
            <ol>
              <li><strong>计算总收入：</strong>包括工资、副业收入、投资收益等</li>
              <li><strong>列出所有支出：</strong>从必需品到娱乐，不遗漏任何项目</li>
              <li><strong>分配每一分钱：</strong>确保收入-支出=0</li>
              <li><strong>定期调整：</strong>根据实际情况调整预算分配</li>
            </ol>

            <h2>预算管理的实用技巧</h2>
            
            <h3>1. 使用数字工具</h3>
            <p>
              利用 FinleyBook 等财务管理应用，可以自动跟踪您的收支，
              并提供详细的分析报告。数字工具的优势包括：
            </p>
            <ul>
              <li>自动分类交易</li>
              <li>实时预算跟踪</li>
              <li>智能提醒功能</li>
              <li>详细的财务报表</li>
            </ul>

            <h3>2. 建立应急基金</h3>
            <p>
              应急基金应该是您预算中的优先项。建议储蓄3-6个月的生活费用，
              以应对突发情况如失业、疾病等。
            </p>

            <h3>3. 定期回顾和调整</h3>
            <p>
              预算不是一成不变的。每月花费30分钟回顾您的预算执行情况：
            </p>
            <ul>
              <li>哪些类别超支了？</li>
              <li>哪些地方可以进一步优化？</li>
              <li>是否需要调整预算分配？</li>
            </ul>

            <h2>常见预算管理误区</h2>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-6 my-8">
              <h3 className="text-red-900 font-semibold mb-4">避免这些常见错误</h3>
              <ul className="space-y-2">
                <li><strong>过于严格：</strong>预算应该现实可行，留有一定弹性</li>
                <li><strong>忽视小额支出：</strong>咖啡、零食等小额支出累积起来也很可观</li>
                <li><strong>没有应急计划：</strong>预算应该包含意外支出的缓冲</li>
                <li><strong>不定期回顾：</strong>预算需要持续监控和调整</li>
              </ul>
            </div>

            <h2>进阶预算策略</h2>
            
            <h3>信封预算法</h3>
            <p>
              为每个支出类别准备一个"信封"（实体或虚拟），
              当月预算用完后就不再在该类别消费。这种方法对控制冲动消费特别有效。
            </p>

            <h3>按优先级排序</h3>
            <p>将您的财务目标按重要性排序：</p>
            <ol>
              <li>生活必需品</li>
              <li>应急基金</li>
              <li>高息债务偿还</li>
              <li>退休储蓄</li>
              <li>其他投资目标</li>
              <li>娱乐和奢侈品</li>
            </ol>

            <h2>开始您的预算管理之旅</h2>
            
            <p>
              预算管理是一个持续的过程，需要耐心和坚持。
              记住，完美的预算不存在，重要的是找到适合您生活方式和财务目标的方法。
            </p>
            
            <p>
              从今天开始，尝试使用 50/30/20 规则制定您的第一个预算，
              并使用 FinleyBook 等工具来跟踪您的进展。
              每一小步的改进都会为您的财务未来带来积极的影响。
            </p>

            <div className="bg-green-50 border-l-4 border-green-400 p-6 my-8">
              <h3 className="text-green-900 font-semibold mb-4">行动清单</h3>
              <ul className="space-y-2">
                <li>✓ 计算您的月净收入</li>
                <li>✓ 列出所有固定支出</li>
                <li>✓ 使用 50/30/20 规则分配预算</li>
                <li>✓ 下载财务管理应用开始跟踪</li>
                <li>✓ 设定第一个储蓄目标</li>
                <li>✓ 制定月度预算回顾计划</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Article Footer */}
        <footer className="mt-12 bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between border-b pb-6 mb-6">
            <div className="flex items-center gap-4">
              <img
                src="https://ui-avatars.com/api/?name=张明&background=0ea5e9&color=fff&size=64"
                alt="张明"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900">张明</h3>
                <p className="text-gray-600">FinleyBook 创始人 & CEO</p>
                <p className="text-sm text-gray-500 mt-1">
                  前阿里巴巴资深技术专家，拥有15年金融科技行业经验
                </p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              关注作者
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">标签：</span>
            {['预算管理', '个人理财', '财务规划'].map(tag => (
              <span 
                key={tag}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </footer>

        {/* Related Articles */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">相关文章</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/blog/investment-basics-2024" className="group">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <img
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="投资指南"
                  className="w-full h-40 object-cover"
                />
                <div className="p-6">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    投资策略
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-3 group-hover:text-blue-600">
                    2024年投资新手指南：稳健投资策略解析
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">
                    投资市场瞬息万变，但基本原则不变...
                  </p>
                </div>
              </div>
            </Link>
            
            <Link href="/blog/emergency-fund-guide" className="group">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <img
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="应急基金"
                  className="w-full h-40 object-cover"
                />
                <div className="p-6">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    理财知识
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-3 group-hover:text-blue-600">
                    应急基金建立指南：为生活意外做好准备
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">
                    应急基金是财务安全的基石...
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </article>
      </div>
    </>
  )
}