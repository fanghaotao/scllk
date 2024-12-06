import { useState, useCallback } from 'react'
import { Difficulty, GameSettings } from '../types/game'

export const useGameSettings = (initialDifficulty: Difficulty = 'easy') => {
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: initialDifficulty
  })

  const updateDifficulty = useCallback((difficulty: Difficulty) => {
    setSettings(prev => ({
      ...prev,
      difficulty
    }))
  }, [])

  return {
    settings,
    updateDifficulty
  }
}