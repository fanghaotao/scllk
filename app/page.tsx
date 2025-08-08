"use client"
import { useRouter } from 'next/navigation'
import { GAME_CONFIG } from './config/gameConfig'

// 定义难度等级配置
const LEVEL_CONFIGS = {
  elementary: {
    icon: 'elementary',
    name: '小学',
    description: '适合初学者的基础关卡',
    bgColor: 'from-green-400 to-blue-500',
    shadowColor: 'shadow-green-500/50'
  },
  middle: {
    icon: 'middle',
    name: '初中',
    description: '需要更多思考的中级关卡',
    bgColor: 'from-purple-400 to-indigo-500',
    shadowColor: 'shadow-purple-500/50'
  },
  high: {
    icon: 'high',
    name: '高中',
    description: '富有挑战性的高级关卡',
    bgColor: 'from-red-400 to-yellow-500',
    shadowColor: 'shadow-red-500/50'
  },
  expert: {
    icon: 'expert',
    name: '专家',
    description: '终极诗词大师挑战',
    bgColor: 'from-gray-700 to-black',
    shadowColor: 'shadow-gray-800/50'
  }
} as const

// 游戏介绍卡片配置
const INFO_CARDS = [
  {
    icon: 'auto_stories',
    title: '寓教于乐',
    description: '通过趣味游戏方式，轻松记忆古诗词，提升文学素养。',
    gradient: 'from-blue-100 to-blue-200'
  },
  {
    icon: 'psychology',
    title: '智力挑战',
    description: '考验记忆力和观察力，培养逻辑思维能力。',
    gradient: 'from-purple-100 to-purple-200'
  },
  {
    icon: 'emoji_events',
    title: '关卡进阶',
    description: '从易到难的关卡设计，循序渐进提升学习兴趣。',
    gradient: 'from-indigo-100 to-indigo-200'
  }
]

// 游戏规则配置
const RULE_ITEMS = [
  { icon: 'touch_app', text: '连接相邻的文字，组成完整的诗句', color: 'text-blue-500' },
  { icon: 'timer', text: '完成一首诗后自动进入下一首', color: 'text-purple-500' },
  { icon: 'save', text: '游戏进度会自动保存', color: 'text-indigo-500' }
]

export default function Home() {
  const router = useRouter()

  const handleLevelSelect = (level: keyof typeof GAME_CONFIG.LEVELS) => {
    router.push(`/game/${level}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl space-y-16">
        {/* 标题区域 */}
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-extrabold text-gray-800 sm:text-6xl md:text-7xl">
            古诗词连连看
          </h1>
          <p className="text-lg text-gray-600 sm:text-xl">
            探索中国传统文化的趣味游戏
          </p>
        </div>

        {/* 游戏介绍 */}
        <div className="space-y-8">
          <h2 className="text-center text-3xl font-bold text-gray-800">
            游戏介绍
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {INFO_CARDS.map(card => (
              <div
                key={card.title}
                className="transform rounded-2xl bg-white/50 p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-xl backdrop-blur-sm"
              >
                <div className={`mb-4 inline-block rounded-full bg-gradient-to-r ${card.gradient} p-3`}>
                  <span className="material-icons text-3xl text-white">{card.icon}</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">{card.title}</h3>
                <p className="text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 难度选择 */}
        <div className="space-y-8">
          <h2 className="text-center text-3xl font-bold text-gray-800">选择难度</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(LEVEL_CONFIGS).map(([level, config]) => (
              <button
                key={level}
                onClick={() => handleLevelSelect(level as keyof typeof GAME_CONFIG.LEVELS)}
                className={`group relative transform rounded-2xl bg-gradient-to-br ${config.bgColor} p-8 text-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${config.shadowColor}`}
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold">{config.name}</h3>
                  <p className="mt-2 text-sm opacity-80">{config.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 游戏说明 */}
        <div className="rounded-2xl bg-white/50 p-8 shadow-lg backdrop-blur-sm">
          <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">游戏说明</h2>
          <div className="space-y-4">
            {RULE_ITEMS.map(rule => (
              <div key={rule.icon} className="flex items-center gap-4 rounded-lg bg-white/60 p-4">
                <span className={`material-icons text-3xl ${rule.color}`}>{rule.icon}</span>
                <span className="text-lg text-gray-700">{rule.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}