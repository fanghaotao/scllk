import { Metadata } from 'next'
import GameWrapper from '@/app/components/GameWrapper'

export const runtime = 'edge'

import { GAME_CONFIG } from '@/app/config/gameConfig'

type Props = {
  params: {
    level: keyof typeof GAME_CONFIG.LEVELS
    stageId: string
  }
}

export async function generateMetadata({
  params
}: Props): Promise<Metadata> {
  const { level, stageId } = params
  const levelName = GAME_CONFIG.LEVELS[level]?.name || '古诗词'
  return {
    title: `第 ${stageId} 关 - ${levelName}`,
    description: `古诗词连连看游戏 - ${levelName}第 ${stageId} 关`
  }
}

export default async function Page({
  params
}: Props) {
  const { level, stageId } = params

  return (
    <GameWrapper 
      level={level}
      stageId={parseInt(stageId, 10)} 
    />
  )
}