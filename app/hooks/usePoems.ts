import { useState, useEffect, useCallback } from 'react'
import { GameLevel } from '@/types/game'
import { ProcessedPoemGroup } from '@/types/poem'
import { processPoem } from '@/utils/poemUtils'
import { GAME_CONFIG } from '../config/gameConfig'

const LEVEL_FILE_MAP = {
  elementary: 'xiaoxue',
  middle: 'chuzhong',
  high: 'gaozhong'
} as const

export const usePoems = (level: GameLevel = 'elementary', stageId?: number) => {
  const [state, setState] = useState<{
    loading: boolean
    error: string | null
    currentPoem: ProcessedPoemGroup[]
  }>({
    loading: true,
    error: null,
    currentPoem: []
  })

  const loadPoemData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const fileName = LEVEL_FILE_MAP[level]
      const response = await fetch(`/res/${fileName}.json`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const poems = await response.json()

      if (!Array.isArray(poems)) {
        throw new Error('诗词数据格式错误')
      }

      // 使用配置的每关诗词数量
      let stagePoems = poems
      if (stageId) {
        const startIndex = (stageId - 1) * GAME_CONFIG.POEMS_PER_STAGE
        stagePoems = poems.slice(
          startIndex, 
          startIndex + GAME_CONFIG.POEMS_PER_STAGE
        )
        
        if (stagePoems.length === 0) {
          throw new Error('该关卡没有诗词数据')
        }
      }

      // 随机选择一首诗
      const randomIndex = Math.floor(Math.random() * stagePoems.length)
      const selectedPoem = stagePoems[randomIndex]

      if (!selectedPoem?.text) {
        throw new Error('诗词数据不完整')
      }

      // 处理诗词数据
      const processedPoem = processPoem(selectedPoem.text)
      // 为每个组添加标题和作者信息
      processedPoem.forEach(group => {
        group.title = selectedPoem.title || ''
        group.author = selectedPoem.author || ''
      })

      setState({
        loading: false,
        error: null,
        currentPoem: processedPoem
      })
    } catch (err) {
      console.error('加载诗词失败:', err)
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : '未知错误',
        currentPoem: []
      }))
    }
  }, [level, stageId])

  useEffect(() => {
    loadPoemData()
  }, [loadPoemData])

  return {
    ...state,
    refreshPoem: loadPoemData
  }
}