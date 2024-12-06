"use client"
import { useRouter } from 'next/navigation'
import { GAME_CONFIG } from './config/gameConfig'

// 定义难度等级配置
const LEVEL_CONFIGS = {
  elementary: {
    icon: '⭐',
    name: '小学',
    description: '适合初学者的基础关卡',
    bgColor: 'from-blue-50',
    iconColor: 'text-yellow-500'
  },
  middle: {
    icon: '⭐⭐',
    name: '初中',
    description: '需要更多思考的中级关卡',
    bgColor: 'from-purple-50',
    iconColor: 'text-yellow-500'
  },
  high: {
    icon: '⭐⭐⭐',
    name: '高中',
    description: '富有挑战性的高级关卡',
    bgColor: 'from-indigo-50',
    iconColor: 'text-yellow-500'
  }
} as const

export default function Home() {
  const router = useRouter()

  const handleLevelSelect = (level: keyof typeof GAME_CONFIG.LEVELS) => {
    router.push(`/game/${level}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        {/* 标题区域 */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-blue-600 sm:text-5xl">古诗词连连看</h1>
          <p className="text-lg text-gray-600">探索中国传统文化的趣味游戏</p>
        </div>

        {/* 游戏介绍 */}
        <div className="mb-12 rounded-xl bg-white p-6 shadow-lg sm:p-8">
          <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">游戏介绍</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-50 p-4 transition-transform hover:scale-105">
              <div className="mb-2 flex items-center gap-2">
                <span className="material-icons text-2xl text-blue-500">school</span>
                <h3 className="font-semibold text-gray-800">寓教于乐</h3>
              </div>
              <p className="text-sm text-gray-600">
                通过趣味游戏方式，轻松记忆古诗词，提升文学素养
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-purple-50 p-4 transition-transform hover:scale-105">
              <div className="mb-2 flex items-center gap-2">
                <span className="material-icons text-2xl text-purple-500">psychology</span>
                <h3 className="font-semibold text-gray-800">智力挑战</h3>
              </div>
              <p className="text-sm text-gray-600">
                考验记忆力和观察力，培养逻辑思维能力
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 p-4 transition-transform hover:scale-105">
              <div className="mb-2 flex items-center gap-2">
                <span className="material-icons text-2xl text-indigo-500">emoji_events</span>
                <h3 className="font-semibold text-gray-800">关卡进阶</h3>
              </div>
              <p className="text-sm text-gray-600">
                从易到难的关卡设计，循序渐进提升学习兴趣
              </p>
            </div>
          </div>
        </div>

        {/* 难度选择 */}
        <div className="mb-8">
          <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">选择难度</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {Object.entries(LEVEL_CONFIGS).map(([level, config]) => (
              <button
                key={level}
                onClick={() => handleLevelSelect(level as keyof typeof GAME_CONFIG.LEVELS)}
                className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
              >
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <span className={`text-2xl ${config.iconColor}`}>
                    {config.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{config.name}</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {config.description}
                    </p>
                  </div>
                </div>
                <div className={`absolute inset-0 z-0 bg-gradient-to-br ${config.bgColor} to-transparent opacity-0 transition-opacity group-hover:opacity-100`} />
              </button>
            ))}
          </div>
        </div>

        {/* 游戏说明 */}
        <div className="rounded-xl bg-white p-6 shadow-lg sm:p-8">
          <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">游戏说明</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-50 p-3">
              <span className="material-icons text-2xl text-blue-500">touch_app</span>
              <span className="text-gray-700">连接相邻的文字，组成完整的诗句</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-50 p-3">
              <span className="material-icons text-2xl text-purple-500">timer</span>
              <span className="text-gray-700">完成一首诗后自动进入下一首</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-indigo-50 p-3">
              <span className="material-icons text-2xl text-indigo-500">save</span>
              <span className="text-gray-700">游戏进度会自动保存</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}