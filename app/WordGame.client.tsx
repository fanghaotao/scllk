"use client"
import { useState, useEffect, useRef, useMemo } from 'react'
import { usePoems } from './hooks/usePoems'
import { useGameSettings } from './hooks/useGameSettings'

import { Connection, GameStats } from './types/game'
import WordCard from './WordCard'
import LineCanvas from './LineCanvas'
import DifficultySelector from './DifficultySelector'
import { WordGroup, ProcessedPoemGroup, GroupProgress } from './types/poem'
import { calculateOptimalGrid, indexToGridPosition, findOptimalArrangement } from './utils/gridUtils'
import { isCompleteGroup } from './utils/gameUtils'
import ScratchCard from './ScratchCard'

const WordGame = () => {
  const { loading, error, currentPoem, refreshPoem } = usePoems()
  const { settings, updateDifficulty } = useGameSettings()
  const gameAreaRef = useRef<HTMLDivElement>(null)

  // 游戏状态
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    completedGroups: new Set()
  })

  // 计算所有字符并打乱顺序
  const [shuffledChars, setShuffledChars] = useState<Array<{
    char: string
    groupId: number
    orderInGroup: number
  }>>([])

  // 连接相关状态
  const [connections, setConnections] = useState<Connection[]>([])
  const [currentPath, setCurrentPath] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [usedCards, setUsedCards] = useState<Set<number>>(new Set())

  // 计算最优网格布局
  const [gridLayout, setGridLayout] = useState<{
    grid: (WordGroup | null)[][]
    rows: number
    cols: number
  }>({ grid: [], rows: 0, cols: 0 })

  // 组进度
  const [groupProgress, setGroupProgress] = useState<Map<number, GroupProgress>>(new Map())

  // 生成并缓存遮罩文字
  const maskedTexts = useMemo(() => {
    return currentPoem.reduce((acc, group) => {
      const maskedText = Array.from(group.text).map(char => 
        Math.random() > 0.5 ? '█' : char
      ).join('')
      acc[group.id] = maskedText
      return acc
    }, {} as Record<number, string>)
  }, [currentPoem]) // 只在诗词改变时重新生成

  useEffect(() => {
    if (currentPoem.length > 0) {
      // 计算所有字符
      const allWords = currentPoem.flatMap(group => group.words)
      
      // 生成初始网格布局
      const layout = calculateOptimalGrid(allWords)
      setGridLayout(layout)
      
      // 优化字符排列
      const optimizedLayout = findOptimalArrangement(allWords, layout.rows, layout.cols)
      setGridLayout(optimizedLayout)
      
      // 重置游戏状态
      setGameStats({
        score: 0,
        completedGroups: new Set()
      })
      setConnections([])
      setCurrentPath([])
      setUsedCards(new Set())
    }
  }, [currentPoem])

  // 根据难度调整游戏规则
  const getDifficultySettings = () => {
    switch (settings.difficulty) {
      case 'easy':
        return {
          showHints: true,    // 显示首字提示
          showOrder: true,    // 显示顺序提示
          forgiving: true     // 允许错误重试
        }
      case 'medium':
        return {
          showHints: true,    // 只显示首字提示
          showOrder: false,   // 不显示顺序提示
          forgiving: true     // 允许错误重试
        }
      case 'hard':
        return {
          showHints: false,   // 不显示提示
          showOrder: false,   // 不显示顺序提示
          forgiving: false    // 错误不能重试
        }
    }
  }

  // 获取卡片中心点坐标
  const getCardCenter = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const gameAreaRect = gameAreaRef.current?.getBoundingClientRect()
    
    if (!gameAreaRect) return { x: 0, y: 0 }
    
    return {
      x: rect.left + rect.width / 2 - gameAreaRect.left,
      y: rect.top + rect.height / 2 - gameAreaRect.top
    }
  }

  // 获取当前路径的连线点
  const getCurrentPathPoints = () => {
    if (currentPath.length < 2) return []
    
    const points: Array<{ x: number; y: number }> = []
    for (let i = 0; i < currentPath.length; i++) {
      const element = document.getElementById(`card-${currentPath[i]}`)
      if (element) {
        points.push(getCardCenter(element))
      }
    }
    return points
  }

  // 验证连接路径是否有效
  const validatePath = (path: number[]) => {
    if (path.length < 2) return false
    
    // 获取路径中的所有词语
    const pathWords = path.map(index => {
      const [row, col] = indexToGridPosition(index, gridLayout.cols)
      return gridLayout.grid[row][col]
    }).filter((word): word is WordGroup => word !== null)

    // 检查是否属于同一组
    const firstWord = pathWords[0]
    if (!firstWord) return false

    // 检查组ID和顺序
    return pathWords.every((word, index) => 
      word.groupId === firstWord.groupId && 
      word.orderInGroup === index
    )
  }

  // 检查相邻性
  const arePositionsAdjacent = (index1: number, index2: number) => {
    const [row1, col1] = indexToGridPosition(index1, gridLayout.cols)
    const [row2, col2] = indexToGridPosition(index2, gridLayout.cols)

    return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1
  }

  // 鼠标事件处理
  const handleMouseDown = (index: number) => {
    if (usedCards.has(index)) return
    setIsDragging(true)
    setCurrentPath([index])
  }

  const handleMouseEnter = (index: number) => {
    if (!isDragging || usedCards.has(index)) return
    
    // 检查是否与当前路径的最后一个位置相邻
    const lastIndex = currentPath[currentPath.length - 1]
    if (lastIndex !== undefined && !arePositionsAdjacent(lastIndex, index)) {
      return
    }

    if (!currentPath.includes(index)) {
      setCurrentPath(prev => [...prev, index])
    }
  }

  // 检查是否完成一组
  const checkCompleteGroup = (path: number[]) => {
    return isCompleteGroup(path, gridLayout.grid, gridLayout.cols, currentPoem)
  }

  // 处理鼠标释放
  const handleMouseUp = () => {
    if (!isDragging) return

    if (validatePath(currentPath) && checkCompleteGroup(currentPath)) {
      const firstIndex = currentPath[0]
      const [row, col] = indexToGridPosition(firstIndex, gridLayout.cols)
      const firstWord = gridLayout.grid[row][col]
      
      if (firstWord) {
        handleConnectionComplete(currentPath, firstWord.groupId)
      }
    }

    setCurrentPath([])
    setIsDragging(false)
  }

  // 处理连接完成
  const handleConnectionComplete = (path: number[], groupId: number) => {
    // 获取当前路径中的字的顺序
    const pathWords = path.map(index => {
      const [row, col] = indexToGridPosition(index, gridLayout.cols)
      return gridLayout.grid[row][col]
    }).filter((word): word is WordGroup => word !== null)

    // 获取该组的所有字数
    const group = currentPoem.find(g => g.id === groupId)
    if (!group) return

    // 只有当连接的字数等于组内总字数时才标记为完成
    if (pathWords.length === group.words.length) {
      // 更新连接
      const newConnections: Connection[] = []
      for (let i = 0; i < path.length - 1; i++) {
        const startCard = document.getElementById(`card-${path[i]}`)
        const endCard = document.getElementById(`card-${path[i + 1]}`)
        
        if (startCard && endCard) {
          newConnections.push({
            startIndex: path[i],
            endIndex: path[i + 1],
            startPoint: getCardCenter(startCard),
            endPoint: getCardCenter(endCard)
          })
        }
      }

      setConnections(prev => [...prev, ...newConnections])
      
      // 更新已使用的卡片
      const newUsedCards = new Set(usedCards)
      path.forEach(index => newUsedCards.add(index))
      setUsedCards(newUsedCards)

      // 更新完成状态
      setGameStats(prev => ({
        ...prev,
        score: prev.score + 10,
        completedGroups: new Set([...prev.completedGroups, groupId])
      }))
    }
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setCurrentPath([])
      setIsDragging(false)
    }
  }

  // 查找有效路径
  const findValidPathForGroup = (groupId: number): number[] | null => {
    const group = currentPoem.find(g => g.id === groupId)
    if (!group) return null

    const chars = group.words
    const startPositions: number[] = []

    // 找到所有可能的起始位置
    gridLayout.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell?.groupId === groupId && cell.orderInGroup === 0) {
          startPositions.push(rowIndex * gridLayout.cols + colIndex)
        }
      })
    })

    // 对每个起始位置尝试找有效路径
    for (const start of startPositions) {
      const visited = new Set<number>([start])
      const path = [start]
      
      if (dfs(start, 1)) {
        return path
      }

      // 深度优先搜索
      function dfs(current: number, nextOrder: number): boolean {
        if (path.length === chars.length) {
          return validatePath(path) && checkCompleteGroup(path)
        }

        const [currentRow, currentCol] = indexToGridPosition(current, gridLayout.cols)
        
        // 检查所有相邻位置
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue

            const newRow = currentRow + dr
            const newCol = currentCol + dc
            
            if (newRow < 0 || newRow >= gridLayout.rows || 
                newCol < 0 || newCol >= gridLayout.cols) {
              continue
            }

            const newIndex = newRow * gridLayout.cols + newCol
            const cell = gridLayout.grid[newRow][newCol]

            if (!cell || visited.has(newIndex) || 
                cell.groupId !== groupId || 
                cell.orderInGroup !== nextOrder) {
              continue
            }

            visited.add(newIndex)
            path.push(newIndex)
            
            if (dfs(newIndex, nextOrder + 1)) {
              return true
            }
            
            visited.delete(newIndex)
            path.pop()
          }
        }
        
        return false
      }
    }

    return null
  }

  // 优化字符排列
  const arrangeChars = () => {
    const allWords = currentPoem.flatMap(group => group.words)
    const totalCells = gridLayout.rows * gridLayout.cols
    const emptySpaces = totalCells - allWords.length
    
    // 确保每组字之间有适当间距
    let arranged: (WordGroup | null)[][] = Array(gridLayout.rows)
      .fill(null)
      .map(() => Array(gridLayout.cols).fill(null))

    let currentRow = 0
    let currentCol = 0

    currentPoem.forEach(group => {
      // 为每组找到有效路径
      const words = group.words
      let placed = false
      
      while (!placed && currentRow < gridLayout.rows) {
        if (currentCol + words.length > gridLayout.cols) {
          currentRow++
          currentCol = 0
          continue
        }

        // 尝试在当前位置放置
        const tempArrangement = arranged.map(row => [...row])
        let canPlace = true
        
        for (let i = 0; i < words.length; i++) {
          if (tempArrangement[currentRow][currentCol + i] !== null) {
            canPlace = false
            break
          }
        }

        if (canPlace) {
          words.forEach((word, i) => {
            arranged[currentRow][currentCol + i] = word
          })
          currentCol += words.length + 1 // 添加间隔
          placed = true
        } else {
          currentCol++
        }
      }
    })

    setGridLayout({
      grid: arranged,
      rows: gridLayout.rows,
      cols: gridLayout.cols
    })
  }

  // 添加触摸事件处理
  const handleTouchStart = (index: number) => {
    if (usedCards.has(index)) return
    setIsDragging(true)
    setCurrentPath([index])
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !gameAreaRef.current) return
    e.preventDefault()

    const touch = e.touches[0]
    const gameArea = gameAreaRef.current
    const gameAreaRect = gameArea.getBoundingClientRect()

    const x = touch.clientX - gameAreaRect.left
    const y = touch.clientY - gameAreaRect.top

    const touchRadius = window.innerWidth < 640 ? 30 : 20

    let minDistance = Infinity
    let closestIndex = -1

    gridLayout.grid.flat().forEach((cell, index) => {
      if (!cell || usedCards.has(index)) return

      const cardElement = document.getElementById(`card-${index}`)
      if (!cardElement) return

      const cardRect = cardElement.getBoundingClientRect()
      const cardCenterX = cardRect.left + cardRect.width / 2 - gameAreaRect.left
      const cardCenterY = cardRect.top + cardRect.height / 2 - gameAreaRect.top

      const distance = Math.sqrt(
        Math.pow(x - cardCenterX, 2) + Math.pow(y - cardCenterY, 2)
      )

      if (distance < touchRadius && distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })

    if (closestIndex !== -1) {
      const lastIndex = currentPath[currentPath.length - 1]
      if (lastIndex !== closestIndex && isAdjacent(lastIndex, closestIndex)) {
        if (!currentPath.includes(closestIndex)) {
          setCurrentPath([...currentPath, closestIndex])
        }
      }
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    if (validatePath(currentPath) && checkCompleteGroup(currentPath)) {
      const firstIndex = currentPath[0]
      const [row, col] = indexToGridPosition(firstIndex, gridLayout.cols)
      const firstWord = gridLayout.grid[row][col]
      
      if (firstWord) {
        handleConnectionComplete(currentPath, firstWord.groupId)
      }
    }

    setCurrentPath([])
    setIsDragging(false)
  }

  // 添加 isAdjacent 函数
  const isAdjacent = (index1: number, index2: number) => {
    if (index1 === -1 || index2 === -1) return false

    const [row1, col1] = indexToGridPosition(index1, gridLayout.cols)
    const [row2, col2] = indexToGridPosition(index2, gridLayout.cols)

    // 计算行列差值的绝对值
    const rowDiff = Math.abs(row1 - row2)
    const colDiff = Math.abs(col1 - col2)

    // 判断是否相邻（包括斜向）
    return rowDiff <= 1 && colDiff <= 1
  }

  // indexToGridPosition 函数（如果还没有的话）
  const indexToGridPosition = (index: number, cols: number): [number, number] => {
    const row = Math.floor(index / cols)
    const col = index % cols
    return [row, col]
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <p className="text-red-600">加载失败: {error}</p>
          <button
            onClick={refreshPoem}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  const difficultySettings = getDifficultySettings()

  return (
    <main className="min-h-screen bg-slate-100 px-2 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-lg sm:max-w-2xl md:max-w-4xl">
        <div className="rounded-lg bg-white p-3 shadow-lg sm:p-6">
          {/* 顶部控制区 */}
          <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={refreshPoem}
              className="w-full rounded bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                sm:w-auto sm:px-4 sm:text-base"
            >
              换一首诗
            </button>
            <div className="flex justify-center">
              <DifficultySelector
                currentDifficulty={settings.difficulty}
                onDifficultyChange={updateDifficulty}
              />
            </div>
          </div>

          {/* 诗歌标题、作者和提示区域 */}
          {currentPoem.length > 0 && (
            <div className="mb-4 space-y-4 sm:mb-6">
              {/* 标题和作者 */}
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800 sm:text-xl md:text-2xl">
                  {currentPoem[0].title || "无题"}
                </h2>
                <p className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm md:text-base">
                  {currentPoem[0].author || "佚名"}
                </p>
              </div>

              {/* 诗句提示区域 */}
              <div className="rounded-lg bg-gray-50 p-2 sm:p-4">
                <h3 className="mb-2 text-center text-xs font-medium text-gray-700 sm:mb-3 sm:text-sm">
                  诗句提示
                </h3>
                <div className={`grid gap-2 sm:gap-3 md:gap-4 ${
                  currentPoem.length <= 2 ? 'grid-cols-1' : 
                  currentPoem.length <= 4 ? 'sm:grid-cols-2' :
                  'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                }`}>
                  {currentPoem.map(group => {
                    const isCompleted = gameStats.completedGroups.has(group.id)
                    return (
                      <div 
                        key={group.id}
                        className="relative h-10 sm:h-12"
                      >
                        <ScratchCard
                          text={group.text}
                          isCompleted={isCompleted}
                          groupId={group.id}
                          maskedText={maskedTexts[group.id]}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 游戏区域 */}
          <div 
            ref={gameAreaRef}
            className="relative mb-4 touch-none rounded-lg border-2 border-dashed border-gray-200 p-1 sm:mb-6 sm:p-4"
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onTouchMove={(e) => handleTouchMove(e as unknown as TouchEvent)}
            onTouchEnd={handleTouchEnd}
          >
            <LineCanvas 
              lines={connections.map(conn => [conn.startPoint, conn.endPoint])}
              currentPath={getCurrentPathPoints()}
            />
            <div 
              className="grid gap-1 sm:gap-2 md:gap-4"
              style={{
                gridTemplateColumns: `repeat(${gridLayout.cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridLayout.rows}, minmax(0, 1fr))`
              }}
            >
              {gridLayout.grid.flat().map((wordGroup, index) => (
                wordGroup ? (
                  <WordCard
                    key={`${wordGroup.word}-${index}`}
                    id={`card-${index}`}
                    character={wordGroup.word}
                    groupId={wordGroup.groupId}
                    orderInGroup={wordGroup.orderInGroup}
                    isSelected={currentPath.includes(index)}
                    isUsed={usedCards.has(index)}
                    showHint={difficultySettings.showHints && wordGroup.orderInGroup === 0}
                    showOrder={difficultySettings.showOrder}
                    onMouseDown={() => handleMouseDown(index)}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onTouchStart={() => handleTouchStart(index)}
                    className="word-card text-sm sm:text-base md:text-lg"
                  />
                ) : (
                  <div key={`empty-${index}`} className="aspect-square" />
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default WordGame