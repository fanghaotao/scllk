import GameWrapper from '@/app/components/GameWrapper'
import path from 'path'
import fs from 'fs/promises'
import { GAME_CONFIG } from '@/app/config/gameConfig'

interface PageProps {
  params: {
    stageId: string
  }
}

// 生成静态参数
export async function generateStaticParams() {
  try {
    // 读取小学诗词数据
    const filePath = path.join(process.cwd(), 'public', 'res', 'xiaoxue.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const poems = JSON.parse(fileContent)
    
    // 计算关卡数
    const stageCount = Math.ceil(poems.length / GAME_CONFIG.POEMS_PER_STAGE)
    
    // 生成关卡ID数组
    return Array.from({ length: stageCount }, (_, i) => ({
      stageId: (i + 1).toString()
    }))
  } catch (error) {
    console.error('Error generating stage params:', error)
    return [{ stageId: '1' }]
  }
}

export default function ElementaryGamePage({ params }: PageProps) {
  return (
    <GameWrapper 
      initialLevel="elementary"
      stageId={parseInt(params.stageId)} 
    />
  )
}