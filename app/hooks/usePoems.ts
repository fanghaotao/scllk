import { useState, useEffect } from 'react'
import { PoemData, ProcessedPoemGroup } from '../types/poem'
import { processPoem, getRandomPoem } from '../utils/poemUtils'

export const usePoems = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPoem, setCurrentPoem] = useState<ProcessedPoemGroup[]>([])

  useEffect(() => {
    const loadPoems = async () => {
      try {
        // 加载诗词数据
        const response = await fetch('../res/ts300.json')
        if (!response.ok) {
          throw new Error('Failed to load poems')
        }

        const data = await response.json()
        const poems: PoemData[] = data
        
        // 随机选择一首诗
        const selectedPoem = getRandomPoem(poems)
        
        // 处理诗词文本
        const processedGroups = processPoem(selectedPoem.text)
        // 为每个组添加标题和作者信息
        processedGroups.forEach(group => {
          group.title = selectedPoem.title || ''
          group.author = selectedPoem.author || ''
        })
        setCurrentPoem(processedGroups)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load poems')
        setLoading(false)
      }
    }

    loadPoems()
  }, [])

  // 获取新的随机诗词
  const refreshPoem = async () => {
    setLoading(true)
    try {
      const response = await fetch('/res/ts300.json')
      if (!response.ok) {
        throw new Error('Failed to load poems')
      }

      const data = await response.json()
      const poems: PoemData[] = data
      const selectedPoem = getRandomPoem(poems)
      const processedGroups = processPoem(selectedPoem.text)
            // 为每个组添加标题和作者信息
      processedGroups.forEach(group => {
        group.title = selectedPoem.title || ''
        group.author = selectedPoem.author || ''
      })
      setCurrentPoem(processedGroups)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load poems')
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    currentPoem,
    refreshPoem
  }
}