import { useState, useEffect, useCallback } from 'react'
import { ProcessedPoemGroup } from '../types/poem'
import { processPoem } from '../utils/poemUtils'

const POEM_FILES = {
  elementary: '/res/xiaoxue.json',
  middle: '/res/chuzhong.json',
  high: '/res/gaozhong.json'
} as const

export const usePoems = (level: keyof typeof POEM_FILES = 'elementary') => {
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
      const poemFile = POEM_FILES[level]
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

      const response = await fetch(poemFile, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`加载失败 (${response.status})`)
      }

      const poems = await response.json()

      if (!Array.isArray(poems) || poems.length === 0) {
        throw new Error('诗词数据格式错误')
      }

      const randomIndex = Math.floor(Math.random() * poems.length)
      const selectedPoem = poems[randomIndex]

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
  }, [level])

  const refreshPoem = useCallback(() => {
    loadPoemData()
  }, [loadPoemData])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      if (!mounted) return
      await loadPoemData()
    }

    load()

    return () => {
      mounted = false
    }
  }, [loadPoemData])

  return {
    ...state,
    refreshPoem
  }
}