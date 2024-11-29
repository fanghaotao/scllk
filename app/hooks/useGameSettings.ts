import { useState } from 'react'
import { Difficulty, GameSettings } from '../types/game'

export const useGameSettings = () => {
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: 'easy'
  })

  const updateDifficulty = (difficulty: Difficulty) => {
    setSettings(prev => ({ ...prev, difficulty }))
  }

  return {
    settings,
    updateDifficulty
  }
}