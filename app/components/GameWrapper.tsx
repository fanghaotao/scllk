'use client'

import dynamic from 'next/dynamic'
import { GAME_CONFIG } from '@/app/config/gameConfig'

const WordGame = dynamic(() => import('@/app/WordGame.client'), {
  ssr: false
})

type GameWrapperProps = {
  level: keyof typeof GAME_CONFIG.LEVELS
  stageId: number
}

export default function GameWrapper({ level, stageId }: GameWrapperProps) {
  return <WordGame initialLevel={level} stageId={stageId} />
}