import { Metadata } from 'next'
import GameWrapper from '@/app/components/GameWrapper'

export const runtime = 'edge'

type Props = {
  params: {
    stageId: string
  }
}

export async function generateMetadata({
  params
}: Props): Promise<Metadata> {
  const stageId = await params.stageId
  return {
    title: `第 ${stageId} 关 - 小学古诗词`,
    description: `古诗词连连看游戏第 ${stageId} 关`
  }
}

export default async function Page({
  params
}: Props) {
  // 等待参数解析
  const stageId =  params.stageId

  return (
    <GameWrapper 
      level="elementary"
      stageId={parseInt(stageId, 10)} 
    />
  )
}