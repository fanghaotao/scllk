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
    title: `第 ${resolvedParams.stageId} 关 - 小学古诗词`,
    description: `古诗词连连看游戏第 ${resolvedParams.stageId} 关`
  }
}

export default async function Page({
  params
}: Props) {
  // 等待参数解析完成
  const resolvedParams = await params
  const stageId = parseInt(resolvedParams.stageId, 10)

  return (
    <GameWrapper 
      level="elementary"
      stageId={stageId} 
    />
  )
}