"use client"
import dynamic from 'next/dynamic'
import { GameLevel } from '../types/game'

const WordGame = dynamic(() => import('../WordGame.client'), {
  ssr: false,
})

interface GameWrapperProps {
  initialLevel: GameLevel
  stageId: number
}

export default function GameWrapper({ initialLevel, stageId }: GameWrapperProps) {
  return <WordGame initialLevel={initialLevel} stageId={stageId} />
}