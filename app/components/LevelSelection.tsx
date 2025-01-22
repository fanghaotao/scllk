"use client"
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getCompletedStages } from '../utils/progressUtils'
import { GAME_CONFIG } from '../config/gameConfig'
import GameTutorial from './GameTutorial'

interface Poem {
  num: number
  title: string
  author: string
  text: string
}

interface Stage {
  id: number
  poems: Poem[]
  isUnlocked: boolean
}

const LEVEL_FILE_MAP = {
  elementary: 'xiaoxue',
  middle: 'chuzhong',
  high: 'gaozhong'
} as const

// 定义难度等级配置
const LEVEL_CONFIGS = {
  elementary: {
    title: '小学古诗词',
    description: '轻松快乐学古诗',
    icon: '⭐',
    bgGradient: 'from-blue-50'
  },
  middle: {
    title: '初中古诗词',
    description: '提升文学素养',
    icon: '⭐⭐',
    bgGradient: 'from-purple-50'
  },
  high: {
    title: '高中古诗词',
    description: '挑战文学巅峰',
    icon: '⭐⭐⭐',
    bgGradient: 'from-indigo-50'
  }
} as const

const LevelSelection = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)

  const level = pathname.split('/')[2] as keyof typeof LEVEL_FILE_MAP
  const levelConfig = LEVEL_CONFIGS[level]

  const handleBack = () => {
    router.push('/')
  }

  useEffect(() => {
    const loadStages = async () => {
      if (!level) return

      try {
        const fileName = LEVEL_FILE_MAP[level]
        const response = await fetch(`/res/${fileName}.json`)
        if (!response.ok) {
          throw new Error('加载关卡数据失败')
        }
        
        const poems: Poem[] = await response.json()
        const completedStages = getCompletedStages(level)
        
        // 将诗词按照配置的数量分组成关卡
        const stagesData: Stage[] = []
        for (let i = 0; i < poems.length; i += GAME_CONFIG.POEMS_PER_STAGE) {
          const stageId = Math.floor(i / GAME_CONFIG.POEMS_PER_STAGE) + 1
          const stagePoems = poems.slice(i, i + GAME_CONFIG.POEMS_PER_STAGE)
          stagesData.push({
            id: stageId,
            poems: stagePoems,
            isUnlocked: completedStages.includes(stageId)
          })
        }
        
        setStages(stagesData)
      } catch (error) {
        console.error('加载关卡数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    // 重置状态
    setStages([])
    setLoading(true)
    loadStages()
  }, [level])

  // 检查是否需要显示教程（只在第一次访问游戏时显示）
  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem('hasCompletedTutorial')
    if (!hasCompletedTutorial) {
      setShowTutorial(true)
    }
  }, [])

  // 处理教程完成
  const handleTutorialComplete = () => {
    localStorage.setItem('hasCompletedTutorial', 'true')
    setShowTutorial(false)
  }

  // 处理跳过教程
  const handleTutorialSkip = () => {
    localStorage.setItem('hasCompletedTutorial', 'true')
    setShowTutorial(false)
  }

  // 修改 handleStageClick 添加延迟导航
  const handleStageClick = (stageId: number, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return
    }
    
    // 如果教程正在显示，不要导航
    if (showTutorial) {
      console.log('Preventing navigation while tutorial is showing')
      return
    }
    
    console.log('Navigating to stage:', stageId)
    router.push(`/game/${level}/stage/${stageId}`)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl text-blue-600">加载中...</div>
          <div className="text-gray-500">正在准备关卡数据</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-600 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
          >
            <span className="material-icons">arrow_back</span>
            <span>返回首页</span>
          </button>
        </div>
        <div className="mb-8 text-center">
          <div className="mb-2 text-2xl font-bold text-yellow-500">{levelConfig.icon}</div>
          <h1 className="mb-2 text-3xl font-bold text-gray-800">{levelConfig.title}</h1>
          <p className="text-gray-600">{levelConfig.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => handleStageClick(stage.id, stage.isUnlocked)}
              className={`group relative overflow-hidden rounded-xl p-6 shadow-lg transition-all 
                ${stage.isUnlocked 
                  ? 'bg-white hover:shadow-xl' 
                  : 'cursor-not-allowed bg-gray-100'}`}
              disabled={!stage.isUnlocked}
            >
              <div className="relative z-10 text-center">
                <div className="mb-2 text-2xl font-bold text-blue-600">
                  第 {stage.id} 关
                </div>
                <div className="text-sm text-gray-500">
                  {stage.isUnlocked ? (
                    <>
                      <div className="mb-1">{stage.poems.length} 首诗词</div>
                      <div className="text-xs text-blue-400">点击开始</div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <span className="material-icons text-gray-400">lock</span>
                      <span>未解锁</span>
                    </div>
                  )}
                </div>
              </div>
              <div 
                className={`absolute inset-0 z-0 bg-gradient-to-br ${levelConfig.bgGradient} 
                  to-transparent opacity-0 transition-opacity 
                  ${stage.isUnlocked ? 'group-hover:opacity-100' : ''}`} 
              />
              {!stage.isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/5">
                  <span className="material-icons text-3xl text-white/70">lock</span>
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-8 rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-center text-xl font-semibold text-gray-800">游戏提示</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-50 p-3">
              <span className="material-icons text-blue-500">info</span>
              <span className="text-gray-600">完成当前关卡后解锁下一关</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-50 p-3">
              <span className="material-icons text-purple-500">save</span>
              <span className="text-gray-600">游戏进度将自动保存</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 教程组件 - 只在第一次访问时显示 */}
      {showTutorial && (
        <GameTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
      
      {/* 添加调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 rounded bg-black/80 p-2 text-xs text-white">
          Level: {level}<br />
          Tutorial: {showTutorial ? 'showing' : 'hidden'}
        </div>
      )}
    </div>
  )
}

export default LevelSelection