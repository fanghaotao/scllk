"use client"
import { useState, useMemo, useRef, useEffect } from 'react'
import WordCard from './WordCard'
import LineCanvas from './LineCanvas'

interface GridPosition {
    row: number
    col: number
  }
  
interface CharPosition {
    char: string
    position: GridPosition
    groupId: number
    orderInGroup: number
  }

interface GameStats {
  score: number
  timeLeft: number
  completedGroups: Set<number>
}

interface Point {
  x: number
  y: number
}

interface Connection {
  startIndex: number
  endIndex: number
  startPoint: Point
  endPoint: Point
}

interface PoemGroup {
    id: number
    text: string
    chars: string[]
  }

// 定义难度级别
type Difficulty = 'easy' | 'medium' | 'hard'

interface GameSettings {
  showConnectionHints: boolean
  difficulty: Difficulty
}

const WordGame = () => {
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    timeLeft: 60,
    completedGroups: new Set()
  })
  
  const [isDragging, setIsDragging] = useState(false)
  const [connections, setConnections] = useState<Connection[]>([])
  const [currentPath, setCurrentPath] = useState<number[]>([])
  const [usedCards, setUsedCards] = useState<Set<number>>(new Set())
  const gameAreaRef = useRef<HTMLDivElement>(null)

  const GRID_ROWS = 4
  const GRID_COLS = 5
  const TOTAL_CELLS = GRID_ROWS * GRID_COLS // 20个格子

  // 定义诗句分组
  const poemGroups = useMemo<PoemGroup[]>(() => [
    { id: 1, text: "床前明月光", chars: ["床", "前", "明", "月", "光"] },
    { id: 2, text: "疑是地上霜", chars: ["疑", "是", "地", "上", "霜"] },
    { id: 3, text: "举头望明月", chars: ["举", "头", "望", "明", "月"] },
    { id: 4, text: "低头思故乡", chars: ["低", "头", "思", "故", "乡"] }
  ], [])

  // 检查位置是否在网格内
  const isValidPosition = (pos: GridPosition): boolean => {
    return pos.row >= 0 && pos.row < GRID_ROWS && 
           pos.col >= 0 && pos.col < GRID_COLS
  }

  // 获取网格中的位置
  const getGridPosition = (index: number): GridPosition => ({
    row: Math.floor(index / GRID_COLS),
    col: index % GRID_COLS
  })

  // 获取位置的索引
  const getPositionIndex = (pos: GridPosition): number => 
    pos.row * GRID_COLS + pos.col

  // 检查两个位置是否相邻
  const isAdjacent = (pos1: GridPosition, pos2: GridPosition): boolean => {
    const rowDiff = Math.abs(pos1.row - pos2.row)
    const colDiff = Math.abs(pos1.col - pos2.col)
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)
  }

  // 获取所有可能的相邻位置
  const getAdjacentPositions = (pos: GridPosition): GridPosition[] => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ]
    
    return directions
      .map(([dRow, dCol]) => ({
        row: pos.row + dRow,
        col: pos.col + dCol
      }))
      .filter(isValidPosition)
  }

  // 为一组字符找到有效的连续位置
  const findValidPathForGroup = (
    chars: string[],
    usedPositions: Set<number>
  ): number[] | null => {
    const path: number[] = []
    const remainingPositions = new Set(
      Array.from({ length: TOTAL_CELLS }, (_, i) => i)
        .filter(i => !usedPositions.has(i))
    )

    const tryBuildPath = (
      charIndex: number,
      lastPos?: GridPosition
    ): boolean => {
      if (charIndex === chars.length) {
        return true
      }

      const availablePositions = lastPos
        ? getAdjacentPositions(lastPos)
            .map(pos => getPositionIndex(pos))
            .filter(index => remainingPositions.has(index))
        : Array.from(remainingPositions)

      // 随机打乱可用位置
      const shuffledPositions = [...availablePositions]
        .sort(() => Math.random() - 0.5)

      for (const posIndex of shuffledPositions) {
        path.push(posIndex)
        remainingPositions.delete(posIndex)

        if (tryBuildPath(
          charIndex + 1,
          getGridPosition(posIndex)
        )) {
          return true
        }

        path.pop()
        remainingPositions.add(posIndex)
      }

      return false
    }

    return tryBuildPath(0) ? path : null
  }

  // 打乱并放置所有字符
  const arrangeChars = (groups: PoemGroup[]): Array<{
    char: string
    groupId: number
    orderInGroup: number
  }> => {
    const result = new Array(TOTAL_CELLS)
    const usedPositions = new Set<number>()
    const shuffledGroups = [...groups].sort(() => Math.random() - 0.5)

    for (const group of shuffledGroups) {
      const path = findValidPathForGroup(group.chars, usedPositions)
      
      if (!path) {
        // 如果找不到有效路径，重新尝试整个布局
        return arrangeChars(groups)
      }

      path.forEach((posIndex, charIndex) => {
        result[posIndex] = {
          char: group.chars[charIndex],
          groupId: group.id,
          orderInGroup: charIndex
        }
        usedPositions.add(posIndex)
      })
    }

    // 确保所有位置都被填充
    if (usedPositions.size !== TOTAL_CELLS) {
      console.error('Not all positions filled:', usedPositions.size)
      return arrangeChars(groups)
    }

    return result
  }

  // 使用新的打乱算法
  const shuffledChars = useMemo(() => {
    const result = arrangeChars(poemGroups)
    
    // 验证所有位置是否都有字符
    if (result.some(item => !item)) {
      console.error('Missing characters in grid')
      return arrangeChars(poemGroups)
    }

    return result
  }, [poemGroups])

  // 检查是否完整连接了整个组
  const isCompleteGroup = (path: number[]): boolean => {
    if (path.length === 0) return false
    
    const groupId = shuffledChars[path[0]].groupId
    const groupLength = poemGroups.find(g => g.id === groupId)?.chars.length || 0
    
    // 必须连接整个组的所有字符
    return path.length === groupLength
  }

  // 验证路径
  const validatePath = (path: number[]): boolean => {
    if (path.length < 2) return false

    const firstChar = shuffledChars[path[0]]
    
    // 验证组和顺序
    for (let i = 0; i < path.length; i++) {
      const current = shuffledChars[path[i]]
      
      if (!current || 
          current.groupId !== firstChar.groupId || 
          current.orderInGroup !== i) {
        return false
      }

      // 验证相邻性
      if (i > 0) {
        const prevPos = getGridPosition(path[i - 1])
        const currentPos = getGridPosition(path[i])
        
        if (!isAdjacent(prevPos, currentPos)) {
          return false
        }
      }
    }

    return true
  }

  const getCardCenter = (element: HTMLElement): Point => {
    const rect = element.getBoundingClientRect()
    const gameAreaRect = gameAreaRef.current?.getBoundingClientRect()
    
    if (!gameAreaRect) return { x: 0, y: 0 }

    return {
      x: rect.left - gameAreaRect.left + rect.width / 2,
      y: rect.top - gameAreaRect.top + rect.height / 2
    }
  }

  // 获取当前路径的所有点
  const getCurrentPathPoints = (): Point[] => {
    return currentPath.map(index => {
      const element = document.getElementById(`card-${index}`)
      return element ? getCardCenter(element) : { x: 0, y: 0 }
    }).filter(point => point.x !== 0 && point.y !== 0)
  }

  const handleMouseDown = (index: number) => {
    if (usedCards.has(index)) return
    
    setIsDragging(true)
    setCurrentPath([index])
  }

  const handleMouseEnter = (index: number) => {
    if (!isDragging || usedCards.has(index)) return
    if (currentPath.includes(index)) return
    
    const newPath = [...currentPath, index]
    
    // 验证新路径是否有效
    if (validatePath(newPath)) {
      setCurrentPath(newPath)
    }
  }

  // 更新鼠标释放处理
  const handleMouseUp = () => {
    if (!isDragging) return

    if (validatePath(currentPath) && isCompleteGroup(currentPath)) {
      console.log('Valid path completed:', currentPath)
      handleConnectionComplete(currentPath)
    } else {
      console.log('Invalid path:', currentPath)
    }

    setCurrentPath([])
    setIsDragging(false)
  }

  // 处理无效连接
  const handleInvalidConnection = () => {
    // 可以添加视觉或声音反馈
    // 例如：短暂显示错误提示或播放提示音
  }

  // 处理鼠标移出游戏区域的情况
  const handleMouseLeave = () => {
    setIsDragging(false)
    setCurrentPath([])
  }

  // 清除所有连线
  const handleClear = () => {
    setConnections([])
    setUsedCards(new Set())
    setCurrentPath([])
    setIsDragging(false)
    setGameStats({
      score: 0,
      timeLeft: 60,
      completedGroups: new Set()
    })
  }

  // 处理有效连接
  const handleConnectionComplete = (path: number[]) => {
    if (!path.length) return
    
    const groupId = shuffledChars[path[0]].groupId
    console.log('Completing connection for group:', groupId)

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
    setGameStats(prev => {
      const newCompletedGroups = new Set(prev.completedGroups)
      newCompletedGroups.add(groupId)
      console.log('Updated completed groups:', Array.from(newCompletedGroups))
      return {
        ...prev,
        score: prev.score + 10,
        completedGroups: newCompletedGroups
      }
    })
  }

  // 处理游戏完成
  const handleGameComplete = () => {
    setShowVictory(true)
    // 3秒后自动隐藏胜利动画
    setTimeout(() => setShowVictory(false), 3000)
  }

  // 更新游戏设置状态
  const [settings, setSettings] = useState<GameSettings>({
    showConnectionHints: false,
    difficulty: 'hard' // 默认高级难度
  })
  
  // 添加胜利动画状态
  const [showVictory, setShowVictory] = useState(false)

  // 获取字符提示信息
  const getCharHint = (char: string, groupId: number, orderInGroup: number): string | null => {
    if (orderInGroup !== 0) return null // 只处理每句第一个字

    switch (settings.difficulty) {
      case 'easy':
        return `第${groupId}句起始字`
      case 'medium':
        return '起始字'
      case 'hard':
        return null
      default:
        return null
    }
  }

  // 设置面板组件
  const SettingsPanel = () => (
    <div className="mb-6 space-y-4 rounded-lg bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">难度设置：</span>
        <div className="flex space-x-4">
          {[
            { value: 'easy', label: '初级' },
            { value: 'medium', label: '中级' },
            { value: 'hard', label: '高级' }
          ].map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center space-x-2"
            >
              <input
                type="radio"
                name="difficulty"
                value={value}
                checked={settings.difficulty === value}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  difficulty: e.target.value as Difficulty
                }))}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.showConnectionHints}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              showConnectionHints: e.target.checked
            }))}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">显示连接提示</span>
        </label>
      </div>
    </div>
  )

  // 优化连接反馈组件
  const ConnectionFeedback = () => {
    const [feedbackMessage, setFeedbackMessage] = useState('')

    useEffect(() => {
      if (!settings.showConnectionHints || currentPath.length === 0) {
        setFeedbackMessage('')
        return
      }

      const groupId = shuffledChars[currentPath[0]].groupId
      const group = poemGroups.find(g => g.id === groupId)
      if (group) {
        setFeedbackMessage(`正在连接: ${group.text}`)
      }
    }, [currentPath, settings.showConnectionHints])

    if (!feedbackMessage) return null

    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 transform">
        <div className="rounded-md bg-blue-100 px-4 py-2 text-sm text-blue-800 shadow-md">
          {feedbackMessage}
        </div>
      </div>
    )
  }

  // 胜利动画组件
  const VictoryAnimation = () => {
    if (!showVictory) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="animate-victory rounded-lg bg-white p-8 text-center shadow-xl">
          <div className="mb-4 text-4xl">🎉</div>
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            恭喜完成！
          </h2>
          <p className="mb-6 text-gray-600">
            最终得分：{gameStats.score}
          </p>
          <button
            className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            onClick={() => {
              setShowVictory(false)
              handleClear()
            }}
          >
            再来一次
          </button>
        </div>
      </div>
    )
  }

  // 添加动画样式
  const victoryStyles = `
    @keyframes victory {
      0% { transform: scale(0.8); opacity: 0; }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-victory {
      animation: victory 0.5s ease-out forwards;
    }
  `

  // 添加调试日志
  useEffect(() => {
    console.log('Completed Groups:', Array.from(gameStats.completedGroups))
  }, [gameStats.completedGroups])

  return (
    <>
      <style>{victoryStyles}</style>
      <main className="min-h-screen bg-slate-100 p-4">
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg">
          {/* 设置面板 */}
          <SettingsPanel />

          {/* 状态栏 */}
          <div className="mb-6 flex justify-between">
            <div className="rounded-md bg-blue-50 px-4 py-2">
              <span className="text-sm font-medium text-blue-700">
                分数: {gameStats.score}
              </span>
            </div>
            <div className="rounded-md bg-green-50 px-4 py-2">
              <span className="text-sm font-medium text-green-700">
                已完成: {gameStats.completedGroups.size}/4
              </span>
            </div>
          </div>

          {/* 诗句提示 */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            {poemGroups.map(group => (
              <div 
                key={group.id}
                className={`rounded-md p-2 text-center transition-colors duration-300 ${
                  gameStats.completedGroups.has(group.id)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {group.text}
              </div>
            ))}
          </div>

          {/* 游戏主区域 */}
          <div 
            ref={gameAreaRef} 
            className="relative mb-6 rounded-lg border-2 border-dashed border-gray-200 p-4"
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
          >
            <ConnectionFeedback />
            <LineCanvas 
              lines={connections.map(conn => [conn.startPoint, conn.endPoint])}
              currentPath={getCurrentPathPoints()}
            />
            <div className="grid grid-cols-5 gap-4">
              {shuffledChars.map((charData, index) => (
                <WordCard
                  key={`${charData.char}-${index}`}
                  id={`card-${index}`}
                  character={charData.char}
                  groupId={charData.groupId}
                  orderInGroup={charData.orderInGroup}
                  difficulty={settings.difficulty}
                  isSelected={currentPath.includes(index)}
                  isUsed={usedCards.has(index)}
                  onMouseDown={() => handleMouseDown(index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                />
              ))}
            </div>
          </div>

          {/* 操作区域 */}
          <div className="flex justify-center gap-4">
            <button
              className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => {}}
              aria-label="开始游戏"
              tabIndex={0}
            >
              开始游戏
            </button>
            <button
              className="rounded-md bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              onClick={handleClear}
              aria-label="清除连线"
              tabIndex={0}
            >
              清除连线
            </button>
          </div>
        </div>

        {/* 胜利动画 */}
        <VictoryAnimation />
      </main>
    </>
  )
}

export default WordGame