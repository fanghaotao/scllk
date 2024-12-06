import { Metadata } from 'next'
import { GAME_CONFIG } from '@/app/config/gameConfig'
import GameWrapper from '@/app/components/GameWrapper'

type GameLevel = keyof typeof GAME_CONFIG.LEVELS

type Params = {
  level: GameLevel
  stageId: string
}

// 添加 generateStaticParams 函数
export async function generateStaticParams() {
  const levels = Object.keys(GAME_CONFIG.LEVELS) as GameLevel[]
  const params = []

  for (const level of levels) {
    // 根据每个难度级别生成关卡参数
    for (let stage = 1; stage <= GAME_CONFIG.LEVELS[level].totalStages; stage++) {
      params.push({
        level: level,
        stageId: stage.toString()
      })
    }
  }

  return params
}

export async function generateMetadata({
  params
}: {
  params: Params
}): Promise<Metadata> {
  return {
    title: `第 ${params.stageId} 关 - 古诗词连连看`,
    description: `古诗词连连看游戏第 ${params.stageId} 关`
  }
}

export default function Page({
  params
}: {
  params: Params
}) {
  return (
    <GameWrapper 
      level={params.level} 
      stageId={parseInt(params.stageId, 10)} 
    />
  )
}