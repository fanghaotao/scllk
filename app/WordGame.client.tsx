"use client"
import { useState, useEffect, useRef } from 'react'
import { usePoems } from './hooks/usePoems'
import { useGameSettings } from './hooks/useGameSettings'

import { Connection, GameStats } from './types/game'
import WordCard from './WordCard'
import LineCanvas from './LineCanvas'
import DifficultySelector from './DifficultySelector'
import { WordGroup, ProcessedPoemGroup, GroupProgress } from './types/poem'
import { calculateOptimalGrid, indexToGridPosition, findOptimalArrangement } from './utils/gridUtils'
import { isCompleteGroup } from './utils/gameUtils'

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

    // 对每个起始位置尝试找到有效路径
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
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-lg sm:max-w-2xl md:max-w-4xl">
        <div className="rounded-lg bg-white p-4 shadow-lg sm:p-6">
          {/* 难度选择器 */}
          <div className="mb-6">
            <DifficultySelector
              currentDifficulty={settings.difficulty}
              onDifficultyChange={updateDifficulty}
            />
          </div>

          {/* 诗句提示区域 */}
          <div className={`mb-6 grid gap-3 sm:gap-4 ${
            currentPoem.length <= 2 ? 'grid-cols-1' : 
            currentPoem.length <= 4 ? 'grid-cols-2' :
            'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
          }`}>
            {currentPoem.map(group => {
              const isCompleted = gameStats.completedGroups.has(group.id)
              return (
                <div 
                  key={group.id}
                  className={`rounded-md p-2 text-center text-sm sm:text-base ${
                    isCompleted
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <div>{group.text}</div>
                </div>
              )
            })}
          </div>

          {/* 游戏区域 */}
          <div 
            ref={gameAreaRef}
            className="relative mb-6 rounded-lg border-2 border-dashed border-gray-200 p-2 sm:p-4"
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
          >
            <LineCanvas 
              lines={connections.map(conn => [conn.startPoint, conn.endPoint])}
              currentPath={getCurrentPathPoints()}
            />
            <div 
              className="grid gap-2 sm:gap-4"
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
                  />
                ) : (
                  <div key={`empty-${index}`} className="aspect-square" />
                )
              ))}
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={refreshPoem}
              className="rounded bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-4 sm:text-base"
            >
              换一首诗
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default WordGame