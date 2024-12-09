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
    currentPoemIndex: number
    stagePoems: Array<{
      text: string
      title?: string
      author?: string
    }>
  }>({
    loading: true,
    error: null,
    currentPoem: [],
    currentPoemIndex: 0,
    stagePoems: []
  })

  // 处理单首诗词的函数
  const processSelectedPoem = useCallback((poem: { text: string, title?: string, author?: string }) => {
    if (!poem?.text) {
      throw new Error('诗词数据不完整')
    }
    console.log('处理诗词:', poem)
    const processedPoem = processPoem(poem.text)
    processedPoem.forEach(group => {
      group.title = poem.title || ''
      group.author = poem.author || ''
    })
    return processedPoem
  }, [])

  // 初始化加载诗词数据
  const initPoemData = useCallback(async () => {
    console.log('initPoemData 被调用 - stageId:', stageId)
    if (!stageId) return

    try {
      const fileName = LEVEL_FILE_MAP[level]
      console.log('准备加载文件:', fileName)
      const response = await fetch(`/res/${fileName}.json`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const poems = await response.json()
      console.log('加载的所有诗词数量:', poems.length)

      if (!Array.isArray(poems)) {
        throw new Error('诗词数据格式错误')
      }

      const startNum = (stageId - 1) * GAME_CONFIG.POEMS_PER_STAGE + 1
      console.log('开始的诗词编号:', startNum)
      
      const stagePoems = poems.filter(poem => 
        poem.num >= startNum && 
        poem.num < startNum + GAME_CONFIG.POEMS_PER_STAGE
      ).sort((a, b) => a.num - b.num)
      
      console.log('当前关卡的诗词:', stagePoems)

      if (stagePoems.length === 0) {
        throw new Error('该关卡没有诗词数据')
      }

      const processedPoem = processSelectedPoem(stagePoems[0])
      console.log('处理后的第一首诗:', processedPoem)

      setState(prev => {
        console.log('设置新状态 - 之前的状态:', prev)
        return {
          loading: false,
          error: null,
          currentPoem: processedPoem,
          currentPoemIndex: 0,
          stagePoems
        }
      })
    } catch (err) {
      console.error('加载诗词失败:', err)
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : '未知错误',
        currentPoem: [],
        currentPoemIndex: 0,
        stagePoems: []
      }))
    }
  }, [level, stageId, processSelectedPoem])

  // 切换到下一首诗
  const nextPoem = useCallback(() => {
    console.log('nextPoem 被调用')
    console.log('当前状态:', state)
    
    const nextIndex = state.currentPoemIndex + 1
    console.log('下一首诗索引:', nextIndex)
    
    if (nextIndex < state.stagePoems.length) {
      try {
        const nextPoem = state.stagePoems[nextIndex]
        console.log('准备切换到的诗词:', nextPoem)
        
        const processedPoem = processSelectedPoem(nextPoem)
        console.log('处理后的下一首诗:', processedPoem)
        
        setState(prev => {
          console.log('更新状态 - 之前:', prev)
          return {
            ...prev,
            currentPoem: processedPoem,
            currentPoemIndex: nextIndex
          }
        })
      } catch (err) {
        console.error('处理下一首诗词失败:', err)
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : '未知错误'
        }))
      }
    } else {
      console.log('没有下一首诗了')
    }
  }, [state, processSelectedPoem])

  // 刷新当前诗词
  const refreshPoem = useCallback(() => {
    console.log('refreshPoem 被调用')
    if (state.stagePoems.length > 0) {
      try {
        const processedPoem = processSelectedPoem(state.stagePoems[state.currentPoemIndex])
        setState(prev => ({
          ...prev,
          currentPoem: processedPoem
        }))
      } catch (err) {
        console.error('刷新诗词失败:', err)
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : '未知错误'
        }))
      }
    }
  }, [state.stagePoems, state.currentPoemIndex, processSelectedPoem])

  useEffect(() => {
    console.log('useEffect 触发 - stageId:', stageId)
    initPoemData()
  }, [initPoemData])

  return {
    ...state,
    nextPoem,
    refreshPoem,
    hasNextPoem: state.currentPoemIndex < state.stagePoems.length - 1
  }
}