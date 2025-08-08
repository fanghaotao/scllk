"use client"
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
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
  isCompleted: boolean
  isUnlocked: boolean
}

const LEVEL_FILE_MAP = {
  elementary: 'xiaoxue',
  middle: 'chuzhong',
  high: 'gaozhong',
  expert: 'gaozhong', // Using high school poems for expert level for now
} as const

const LEVEL_CONFIGS = {
  elementary: {
    title: '小学篇',
    description: '轻松快乐学古诗',
    icon: 'school',
    gradient: 'from-green-400 to-blue-500',
    bgColor: 'bg-green-50'
  },
  middle: {
    title: '初中篇',
    description: '提升文学素养',
    icon: 'history_edu',
    gradient: 'from-purple-400 to-indigo-500',
    bgColor: 'bg-purple-50'
  },
  high: {
    title: '高中篇',
    description: '挑战文学巅峰',
    icon: 'military_tech',
    gradient: 'from-red-400 to-yellow-500',
    bgColor: 'bg-red-50'
  },
  expert: {
    title: '专家篇',
    description: '终极诗词大师挑战',
    icon: 'workspace_premium',
    gradient: 'from-gray-700 to-black',
    bgColor: 'bg-gray-100'
  }
} as const

const LevelSelection = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)

  const level = useMemo(() => {
    const segments = pathname.split('/')
    return segments[2] as keyof typeof LEVEL_FILE_MAP
  }, [pathname])

  const levelConfig = useMemo(() => LEVEL_CONFIGS[level] || LEVEL_CONFIGS.elementary, [level])

  useEffect(() => {
    const loadStages = async () => {
      if (!level) return

      try {
        const fileName = LEVEL_FILE_MAP[level]
        const response = await fetch(`/res/${fileName}.json`)
        if (!response.ok) throw new Error('加载关卡数据失败')
        
        const poems: Poem[] = await response.json()
        const completedStages = getCompletedStages(level)
        
        const stagesData: Stage[] = []
        for (let i = 0; i < poems.length; i += GAME_CONFIG.POEMS_PER_STAGE) {
          const stageId = Math.floor(i / GAME_CONFIG.POEMS_PER_STAGE) + 1
          const stagePoems = poems.slice(i, i + GAME_CONFIG.POEMS_PER_STAGE)
          const isCompleted = completedStages.includes(stageId)
          const isUnlocked = stageId === 1 || completedStages.includes(stageId - 1)

          stagesData.push({
            id: stageId,
            poems: stagePoems,
            isCompleted,
            isUnlocked
          })
        }
        
        setStages(stagesData)
      } catch (error) {
        console.error('加载关卡数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    loadStages()
  }, [level])

  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem('hasCompletedTutorial')
    if (!hasCompletedTutorial) {
      setShowTutorial(true)
    }
  }, [])

  const handleTutorialComplete = () => {
    localStorage.setItem('hasCompletedTutorial', 'true')
    setShowTutorial(false)
  }

  const handleStageClick = (stageId: number, isUnlocked: boolean) => {
    if (!isUnlocked || showTutorial) return
    router.push(`/game/${level}/stage/${stageId}`)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-lg font-medium text-gray-600">正在加载关卡...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4 sm:p-6 md:p-8`}>
      <div className="mx-auto max-w-7xl">
        <header className="relative mb-8 flex items-center justify-center">
          <button
            onClick={() => router.push('/')}
            className="absolute left-0 top-1/2 -translate-y-1/2 transform rounded-full bg-white/50 p-3 text-gray-700 shadow-md transition-all hover:scale-110 hover:shadow-lg backdrop-blur-sm"
          >
            <span className="material-icons">arrow_back_ios_new</span>
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-800 sm:text-5xl">{levelConfig.title}</h1>
            <p className="mt-2 text-lg text-gray-600">{levelConfig.description}</p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {stages.map((stage) => {
            const status = stage.isCompleted ? 'completed' : stage.isUnlocked ? 'unlocked' : 'locked'
            return (
              <button
                key={stage.id}
                onClick={() => handleStageClick(stage.id, stage.isUnlocked)}
                className={`group relative aspect-square transform rounded-2xl p-4 shadow-lg transition-all duration-300
                  ${status === 'unlocked' && 'bg-white/60 hover:-translate-y-2 hover:shadow-2xl backdrop-blur-sm'}
                  ${status === 'completed' && `bg-gradient-to-br ${levelConfig.gradient} text-white hover:shadow-2xl`}
                  ${status === 'locked' && 'cursor-not-allowed bg-gray-200/50'}`}
                disabled={!stage.isUnlocked}
              >
                <div className="flex h-full flex-col items-center justify-center text-center">
                  {status === 'locked' ? (
                    <span className="material-icons text-4xl text-gray-400">lock</span>
                  ) : (
                    <>
                      <div className={`text-3xl font-bold ${status === 'completed' ? 'text-white' : 'text-gray-700'}`}>
                        第 {stage.id} 关
                      </div>
                      <div className={`mt-2 text-xs ${status === 'completed' ? 'opacity-80' : 'text-gray-500'}`}>
                        {stage.poems.length} 首诗词
                      </div>
                      {status === 'completed' && (
                        <div className="absolute top-2 right-2 rounded-full bg-white/30 p-1">
                          <span className="material-icons text-sm text-white">check</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <footer className="mt-12 rounded-2xl bg-white/50 p-6 shadow-lg backdrop-blur-sm">
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">游戏提示</h2>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex items-center gap-3 rounded-lg bg-white/60 p-3">
              <span className="material-icons text-blue-500">info</span>
              <span className="text-gray-700">完成当前关卡后解锁下一关</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/60 p-3">
              <span className="material-icons text-purple-500">save</span>
              <span className="text-gray-700">游戏进度将自动保存</span>
            </div>
          </div>
        </footer>
      </div>
      
      {showTutorial && (
        <GameTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialComplete}
        />
      )}
    </div>
  )
}

export default LevelSelection