"use client"
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { usePoems } from './hooks/usePoems'
import { useGameSettings } from './hooks/useGameSettings'
import { useRouter } from 'next/navigation'

import { Connection, Difficulty, GameStats, GameLevel, WordGameProps } from './types/game'
import WordCard from './components/WordCard'
import LineCanvas from './components/LineCanvas'
import { WordGroup, GroupProgress } from './types/poem'
import { findOptimalArrangement } from './utils/gridUtils'
import { isCompleteGroup } from './utils/gameUtils'
import ScratchCard from './components/ScratchCard'
import { saveStageCompletion } from './utils/progressUtils'
import { GAME_CONFIG } from './config/gameConfig'

interface VictoryModalProps {
  onNextStage: () => void
  onReplay: () => void
  onBack: () => void
  isLastStage: boolean
}

const VictoryModal = ({ onNextStage, onReplay, onBack, isLastStage }: VictoryModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mb-6">
          <span className="material-icons text-7xl text-yellow-400">emoji_events</span>
        </div>
        <h3 className="mb-4 text-3xl font-bold text-gray-800">
          {isLastStage ? '恭喜通关！' : '恭喜过关！'}
        </h3>
        <div className="mt-8 space-y-4">
          {!isLastStage && (
            <button
              onClick={onNextStage}
              className="w-full transform rounded-full bg-blue-500 px-8 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105"
            >
              下一关
            </button>
          )}
          <button
            onClick={onReplay}
            className="w-full transform rounded-full bg-gray-100 px-8 py-3 font-semibold text-gray-700 transition-transform hover:scale-105"
          >
            {isLastStage ? '重新挑战' : '重玩本关'}
          </button>
          <button
            onClick={onBack}
            className="w-full transform rounded-full bg-gray-100 px-8 py-3 font-semibold text-gray-700 transition-transform hover:scale-105"
          >
            返回关卡选择
          </button>
        </div>
      </div>
    </div>
  )
}

const WordGame = ({ initialLevel = GAME_CONFIG.DEFAULT_LEVEL, stageId }: WordGameProps) => {
  const router = useRouter()
  const [showVictory, setShowVictory] = useState(false)
  const [isStageComplete, setIsStageComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completedPoemCount, setCompletedPoemCount] = useState(0)
  const [showNextPoemCountdown, setShowNextPoemCountdown] = useState(false)
  const [countdown, setCountdown] = useState(GAME_CONFIG.COUNTDOWN_SECONDS)
  
  const mapLevelToDifficulty = (level: GameLevel): Difficulty => {
    switch (level) {
      case 'elementary': return 'easy'
      case 'middle': return 'medium'
      case 'high': return 'hard'
      case 'expert': return 'expert'
      default: return 'easy'
    }
  }

  const initialDifficulty = useMemo(() => mapLevelToDifficulty(initialLevel), [initialLevel])
  
  const { settings, updateDifficulty } = useGameSettings(initialDifficulty)
  const { loading, error, currentPoem, refreshPoem, nextPoem } = usePoems(initialLevel, stageId)
  const gameAreaRef = useRef<HTMLDivElement>(null)

  const [gameStats, setGameStats] = useState<GameStats>({ score: 0, completedGroups: new Set() })
  const [connections, setConnections] = useState<Connection[]>([])
  const [currentPath, setCurrentPath] = useState<number[]>([])
  const [invalidPath, setInvalidPath] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [usedCards, setUsedCards] = useState<Set<number>>(new Set())
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)
  const [gridLayout, setGridLayout] = useState<{ grid: (WordGroup | null)[][]; rows: number; cols: number }>({ grid: [], rows: 0, cols: 0 })

  const maskedTexts = useMemo(() => {
    return currentPoem.reduce((acc, group) => {
      acc[group.id] = Array.from(group.text).map(char => Math.random() > 0.5 ? '█' : char).join('')
      return acc
    }, {} as Record<number, string>)
  }, [currentPoem])

  useEffect(() => {
    if (currentPoem.length > 0) {
      const allWords = currentPoem.flatMap(group => group.words)
      const layout = findOptimalArrangement(allWords)
      setGridLayout(layout)
      
      setGameStats(prev => ({ ...prev, completedGroups: new Set() }))
      setConnections([])
      setCurrentPath([])
      setUsedCards(new Set())
    }
  }, [currentPoem])

  useEffect(() => {
    updateDifficulty(initialDifficulty)
  }, [initialDifficulty, updateDifficulty])

  const difficultySettings = useMemo(() => {
    switch (settings.difficulty) {
      case 'medium': return { showHints: true, showOrder: false, forgiving: true }
      case 'hard': return { showHints: false, showOrder: false, forgiving: false }
      case 'expert': return { showHints: false, showOrder: false, forgiving: false }
      default: return { showHints: true, showOrder: true, forgiving: true }
    }
  }, [settings.difficulty])

  const getCardCenter = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const gameAreaRect = gameAreaRef.current?.getBoundingClientRect()
    if (!gameAreaRect) return { x: 0, y: 0 }
    return {
      x: rect.left + rect.width / 2 - gameAreaRect.left,
      y: rect.top + rect.height / 2 - gameAreaRect.top
    }
  }

  const getCurrentPathPoints = () => {
    return currentPath.map(index => {
      const element = document.getElementById(`card-${index}`)
      return element ? getCardCenter(element) : { x: 0, y: 0 }
    })
  }

  const getInvalidPathPoints = () => {
    return invalidPath.map(index => {
      const element = document.getElementById(`card-${index}`)
      return element ? getCardCenter(element) : { x: 0, y: 0 }
    })
  }

  const validatePath = (path: number[]) => {
    if (path.length < 2) return false
    const pathWords = path.map(index => gridLayout.grid[Math.floor(index / gridLayout.cols)][index % gridLayout.cols]).filter(Boolean) as WordGroup[]
    const firstWord = pathWords[0]
    return pathWords.every((word, i) => word.groupId === firstWord.groupId && word.orderInGroup === i)
  }

  const arePositionsAdjacent = (index1: number, index2: number) => {
    const [row1, col1] = [Math.floor(index1 / gridLayout.cols), index1 % gridLayout.cols]
    const [row2, col2] = [Math.floor(index2 / gridLayout.cols), index2 % gridLayout.cols]
    return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1
  }

  const handleInteractionStart = (index: number) => {
    if (usedCards.has(index)) return
    setIsDragging(true)
    setCurrentPath([index])
  }

  const handleInteractionMove = (index: number) => {
    if (!isDragging || usedCards.has(index)) return
    const lastIndex = currentPath[currentPath.length - 1]
    if (lastIndex !== undefined && arePositionsAdjacent(lastIndex, index) && !currentPath.includes(index)) {
      setCurrentPath(prev => [...prev, index])
    }
  }

  const handleInteractionEnd = () => {
    if (!isDragging) return
    if (validatePath(currentPath) && isCompleteGroup(currentPath, gridLayout.grid, gridLayout.cols, currentPoem)) {
      const firstWord = gridLayout.grid[Math.floor(currentPath[0] / gridLayout.cols)][currentPath[0] % gridLayout.cols]
      if (firstWord) handleConnectionComplete(currentPath, firstWord.groupId)
    } else if (currentPath.length > 1) {
      setInvalidPath(currentPath)
    }
    setCurrentPath([])
    setIsDragging(false)
  }

  useEffect(() => {
    if (invalidPath.length > 0) {
      const timer = setTimeout(() => setInvalidPath([]), 500)
      return () => clearTimeout(timer)
    }
  }, [invalidPath])

  const handleConnectionComplete = (path: number[], groupId: number) => {
    const group = currentPoem.find(g => g.id === groupId)
    if (!group || path.length !== group.words.length) return

    const newConnections = []
    for (let i = 0; i < path.length - 1; i++) {
      const startCard = document.getElementById(`card-${path[i]}`)
      const endCard = document.getElementById(`card-${path[i + 1]}`)
      if (startCard && endCard) {
        newConnections.push({
          startIndex: path[i], endIndex: path[i + 1],
          startPoint: getCardCenter(startCard), endPoint: getCardCenter(endCard)
        })
      }
    }
    setConnections(prev => [...prev, ...newConnections])
    setUsedCards(prev => new Set([...prev, ...path]))
    setGameStats(prev => ({ ...prev, completedGroups: new Set([...prev.completedGroups, groupId]) }))
  }

  const handleMouseLeave = () => {
    if (isDragging) handleInteractionEnd()
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !gameAreaRef.current) return
    e.preventDefault()
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    if (element && element.id.startsWith('card-')) {
      const index = parseInt(element.id.split('-')[1], 10)
      handleInteractionMove(index)
    }
  }

  const [isProcessingCompletion, setIsProcessingCompletion] = useState(false)

  const handlePoemComplete = useCallback(async () => {
    if (isProcessingCompletion) return
    setIsProcessingCompletion(true)
    
    const newCompletedCount = completedPoemCount + 1
    if (newCompletedCount >= GAME_CONFIG.POEMS_PER_STAGE) {
      setShowVictory(true)
      setIsStageComplete(true)
      if (stageId) await saveStageCompletion(initialLevel, stageId)
    } else {
      setCompletedPoemCount(newCompletedCount)
      setShowNextPoemCountdown(true)
      setCountdown(GAME_CONFIG.COUNTDOWN_SECONDS)
    }
    setTimeout(() => setIsProcessingCompletion(false), 100)
  }, [completedPoemCount, isProcessingCompletion, initialLevel, stageId])

  useEffect(() => {
    if (currentPoem.length > 0 && !showNextPoemCountdown && !showVictory && !isProcessingCompletion) {
      const allGroupsComplete = currentPoem.every(group => gameStats.completedGroups.has(group.id))
      if (allGroupsComplete) handlePoemComplete()
    }
  }, [gameStats.completedGroups, currentPoem, handlePoemComplete, showVictory, showNextPoemCountdown, isProcessingCompletion])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showNextPoemCountdown && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    } else if (showNextPoemCountdown && countdown === 0) {
      setShowNextPoemCountdown(false)
      nextPoem()
      setProgress(0)
    }
    return () => clearTimeout(timer)
  }, [showNextPoemCountdown, countdown, nextPoem])

  const resetGameState = useCallback(() => {
    setShowVictory(false)
    setIsStageComplete(false)
    setCompletedPoemCount(0)
    setGameStats({ score: 0, completedGroups: new Set() })
    setConnections([])
    setCurrentPath([])
    setUsedCards(new Set())
    setProgress(0)
    refreshPoem()
  }, [refreshPoem])

  const handleNextStage = useCallback(() => router.push(`/game/${initialLevel}/stage/${stageId + 1}`), [router, initialLevel, stageId])
  const handleBack = () => router.push(`/game/${initialLevel}`)
  const isLastStage = useMemo(() => false, [])

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-lg font-medium text-gray-600">正在准备诗词...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="text-center">
        <p className="mb-4 text-lg text-red-500">{error}</p>
        <button onClick={resetGameState} className="rounded-lg bg-blue-500 px-6 py-2 text-white">重试</button>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4 sm:p-6 md:p-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="relative mb-4 flex items-center justify-center">
          <button onClick={handleBack} className="absolute left-0 top-1/2 -translate-y-1/2 transform rounded-full bg-white/50 p-3 text-gray-700 shadow-md transition-all hover:scale-110 hover:shadow-lg backdrop-blur-sm">
            <span className="material-icons">arrow_back_ios_new</span>
          </button>
          <div className="rounded-full bg-white/60 px-6 py-2 text-lg font-bold text-gray-700 shadow-md backdrop-blur-sm">
            第 {stageId} 关
          </div>
        </header>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>关卡进度</span>
              <span>{completedPoemCount} / {GAME_CONFIG.POEMS_PER_STAGE}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/60 shadow-inner backdrop-blur-sm">
              <div className="h-full rounded-full bg-green-400 transition-all duration-500" style={{ width: `${(completedPoemCount / GAME_CONFIG.POEMS_PER_STAGE) * 100}%` }} />
            </div>
          </div>

          <div className="rounded-2xl bg-white/50 p-6 shadow-lg backdrop-blur-sm">
            {currentPoem.length > 0 && (
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-gray-800">{currentPoem[0].title || "无题"}</h2>
                <p className="mt-2 text-lg text-gray-500">{currentPoem[0].author || "佚名"}</p>
              </div>
            )}

            <div className="space-y-2">
              {currentPoem.map(group => (
                <ScratchCard key={group.id} text={group.text} isCompleted={gameStats.completedGroups.has(group.id)} />
              ))}
            </div>
          </div>

          <div ref={gameAreaRef} className="relative touch-none rounded-2xl bg-white/50 p-4 shadow-lg backdrop-blur-sm" onMouseLeave={handleMouseLeave} onMouseUp={handleInteractionEnd} onTouchEnd={handleInteractionEnd} onTouchMove={handleTouchMove}>
            <LineCanvas lines={connections.map(c => [c.startPoint, c.endPoint])} currentPath={getCurrentPathPoints()} invalidPath={getInvalidPathPoints()} />
            <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)` }}>
              {gridLayout.grid.flat().map((word, index) =>
                word ? (
                  <WordCard
                      key={`${word.word}-${index}`}
                      id={`card-${index}`}
                      character={word.word}
                      isSelected={currentPath.includes(index)}
                      isUsed={usedCards.has(index)}
                    showHint={difficultySettings.showHints && word.orderInGroup === 0}
                    showOrder={difficultySettings.showOrder}
                      orderInGroup={word.orderInGroup}
                      onMouseDown={() => handleInteractionStart(index)}
                      onMouseEnter={() => handleInteractionMove(index)}
                    onTouchStart={() => handleInteractionStart(index)}
                  />
                ) : <div key={`empty-${index}`} className="aspect-square" />
              )}
            </div>
          </div>
        </div>
      </div>

      {showNextPoemCountdown && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mb-4 text-5xl font-bold text-white">下一首</div>
          <div className="text-8xl font-extrabold text-white">{countdown}</div>
        </div>
      )}

      {showVictory && (
        <VictoryModal onNextStage={handleNextStage} onReplay={resetGameState} onBack={handleBack} isLastStage={isLastStage} />
      )}
    </main>
  )
}

export default WordGame