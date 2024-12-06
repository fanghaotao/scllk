import GameWrapper from '@/app/components/GameWrapper'
import { GameLevel } from '@/app/types/game'

interface GamePageProps {
  params: {
    level: GameLevel
    stageId: string
  }
}

export default function GamePage({ params }: GamePageProps) {
  return (
    <GameWrapper 
      initialLevel={params.level} 
      stageId={parseInt(params.stageId)} 
    />
  )
}