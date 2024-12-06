"use client"
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const levels = [
  {
    id: 'elementary',
    name: '小学',
    description: '简单的古诗词，适合入门',
    color: 'from-green-500 to-green-700',
    hoverColor: 'hover:from-green-600 hover:to-green-800',
  },
  {
    id: 'middle',
    name: '初中',
    description: '中等难度的古诗词，需要一定积累',
    color: 'from-blue-500 to-blue-700',
    hoverColor: 'hover:from-blue-600 hover:to-blue-800',
  },
  {
    id: 'high',
    name: '高中',
    description: '较难的古诗词，考验你的文学素养',
    color: 'from-purple-500 to-purple-700',
    hoverColor: 'hover:from-purple-600 hover:to-purple-800',
  },
]

export default function Home() {
  const router = useRouter()
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

  const handleStartGame = () => {
    if (selectedLevel) {
      router.push(`/game/${selectedLevel}`)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* 标题区域 */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            诗词连连看
          </h1>
          <p className="text-lg text-gray-600">
            通过连接文字来完成古诗词，提升你的文学素养
          </p>
        </div>

        {/* 游戏说明 */}
        <div className="mb-12 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            游戏玩法
          </h2>
          <div className="space-y-3 text-gray-600">
            <p>1. 选择适合你水平的难度关卡</p>
            <p>2. 在游戏界面中寻找诗句中的汉字</p>
            <p>3. 按照正确的顺序连接汉字，完成诗句</p>
            <p>4. 所有诗句完成后即可通关</p>
          </div>
        </div>

        {/* 关卡选择 */}
        <div className="mb-8">
          <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
            选择难度
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {levels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`relative rounded-lg p-6 text-left transition-all duration-200
                  ${
                    selectedLevel === level.id
                      ? 'ring-2 ring-offset-2 ring-blue-500'
                      : ''
                  }
                `}
              >
                <div
                  className={`absolute inset-0 rounded-lg bg-gradient-to-br ${level.color} 
                    transition-all duration-200 ${level.hoverColor} opacity-90`}
                />
                <div className="relative space-y-2 text-white">
                  <h3 className="text-xl font-semibold">{level.name}</h3>
                  <p className="text-sm opacity-90">{level.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 开始按钮 */}
        <div className="text-center">
          <button
            onClick={handleStartGame}
            disabled={!selectedLevel}
            className={`rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-3 
              text-lg font-semibold text-white shadow-lg transition-all duration-200
              hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50`}
          >
            开始游戏
          </button>
        </div>
      </div>
    </main>
  )
}