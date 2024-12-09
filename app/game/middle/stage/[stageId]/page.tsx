import { Metadata } from 'next'
import GameWrapper from '@/app/components/GameWrapper'

export const runtime = 'edge'

type Props = {
  params: Promise<{
    stageId: string
  }>
}

export async function generateMetadata({
  params
}: Props): Promise<Metadata> {
  const resolvedParams = await params
  return {
    title: `第 ${resolvedParams.stageId} 关 - 初中古诗词`,
    description: `古诗词连连看游戏第 ${resolvedParams.stageId} 关`
  }
}

export default async function Page({
  params
}: Props) {
  const resolvedParams = await params
  const stageId = parseInt(resolvedParams.stageId, 10)

  return (
    <GameWrapper 
      level="middle"
      stageId={stageId} 
    />
  )
}