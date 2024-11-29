import { WordGroup } from '../types/poem'

interface GridLayout {
  grid: (WordGroup | null)[][]
  rows: number
  cols: number
}

export const calculateOptimalGrid = (words: WordGroup[]): GridLayout => {
  const totalWords = words.length
  
  if (totalWords === 0) {
    return { grid: [[]], rows: 0, cols: 0 }
  }

  const getGridDimensions = (total: number) => {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false
    const maxCols = isMobile ? 4 : 5
    const minCols = 3
    const cols = Math.max(minCols, Math.min(maxCols, Math.ceil(Math.sqrt(total))))
    const rows = Math.ceil(total / cols)
    return { rows, cols, isMobile }
  }

  const { rows: initialRows, cols, isMobile } = getGridDimensions(totalWords)
  
  const grid: (WordGroup | null)[][] = Array.from(
    { length: initialRows + 1 },
    () => Array(cols).fill(null)
  )

  // 按组分类
  const groupedWords = words.reduce((acc, word) => {
    if (!acc[word.groupId]) {
      acc[word.groupId] = []
    }
    acc[word.groupId].push(word)
    return acc
  }, {} as Record<number, WordGroup[]>)

  // 对每组词语排序
  Object.values(groupedWords).forEach(group => {
    group.sort((a, b) => a.orderInGroup - b.orderInGroup)
  })

  // 优化分布策略
  const distributeWords = () => {
    const groups = Object.values(groupedWords)
    
    // 随机打乱组的顺序
    const shuffledGroups = [...groups].sort(() => Math.random() - 0.5)
    
    let currentRow = 0
    let currentCol = 0
    let maxUsedRow = 0

    // 计算每行可以放置的组数
    const groupsPerRow = Math.floor(cols / 2) // 每组之间留出间隔

    shuffledGroups.forEach((group, groupIndex) => {
      // 检查当前行是否有足够空间
      if (currentCol + group.length > cols) {
        currentRow++
        currentCol = 0
      }

      // 每隔几个组换行，确保分布更均匀
      if (groupIndex > 0 && groupIndex % groupsPerRow === 0) {
        currentRow++
        currentCol = Math.floor(Math.random() * 2) // 随机起始列位置
      }

      // 确保有足够的行
      while (currentRow >= grid.length) {
        grid.push(Array(cols).fill(null))
      }

      // 放置当前组的词语
      group.forEach(word => {
        grid[currentRow][currentCol] = word
        maxUsedRow = Math.max(maxUsedRow, currentRow)
        currentCol++
      })

      // 在组之间添加随机间隔
      currentCol += 1 + Math.floor(Math.random() * 2)
      if (currentCol >= cols) {
        currentRow++
        currentCol = Math.floor(Math.random() * 2) // 随机起始列位置
      }
    })

    return maxUsedRow
  }

  // 尝试多次分布，选择最好的结果
  let bestGrid = grid
  let bestMaxRow = Infinity
  
  for (let i = 0; i < 5; i++) { // 尝试5次，选择行数最少的
    const tempGrid = Array.from(
      { length: initialRows + 1 },
      () => Array(cols).fill(null)
    )
    Object.assign(grid, tempGrid)
    
    const maxRow = distributeWords()
    if (maxRow < bestMaxRow) {
      bestMaxRow = maxRow
      bestGrid = JSON.parse(JSON.stringify(grid))
    }
  }

  // 处理最终网格
  const finalGrid = bestGrid
    .slice(0, bestMaxRow + 2)
    .map(row => {
      const newRow = Array(cols).fill(null)
      row.forEach((cell, index) => {
        if (index < cols) {
          newRow[index] = cell
        }
      })
      return newRow
    })

  return {
    grid: finalGrid,
    rows: finalGrid.length,
    cols
  }
}

export const indexToGridPosition = (index: number, cols: number): [number, number] => {
  const row = Math.floor(index / cols)
  const col = index % cols
  return [row, col]
}

export const findOptimalArrangement = (
  words: WordGroup[],
  rows: number,
  cols: number
): { grid: (WordGroup | null)[][]; rows: number; cols: number } => {
  // 创建空网格
  const grid: (WordGroup | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null))

  // 按组分类词语
  const groupedWords = words.reduce((acc, word) => {
    if (!acc[word.groupId]) {
      acc[word.groupId] = []
    }
    acc[word.groupId].push(word)
    return acc
  }, {} as Record<number, WordGroup[]>)

  // 为每组找到最佳位置
  Object.values(groupedWords).forEach(group => {
    const path = findValidPathForGroup(group, grid, rows, cols)
    if (path) {
      path.forEach((pos, index) => {
        const [row, col] = indexToGridPosition(pos, cols)
        grid[row][col] = group[index]
      })
    }
  })

  return { grid, rows, cols }
}

// 查找有效路径的辅助函数
const findValidPathForGroup = (
  group: WordGroup[],
  grid: (WordGroup | null)[][],
  rows: number,
  cols: number
): number[] | null => {
  const visited = new Set<number>()
  const path: number[] = []

  const dfs = (index: number, wordIndex: number): boolean => {
    if (wordIndex === group.length) {
      return true
    }

    const [currentRow, currentCol] = indexToGridPosition(index, cols)

    // 检查相邻位置
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue

        const newRow = currentRow + dr
        const newCol = currentCol + dc

        if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
          continue
        }

        const newIndex = newRow * cols + newCol
        if (visited.has(newIndex) || grid[newRow][newCol] !== null) {
          continue
        }

        visited.add(newIndex)
        path.push(newIndex)

        if (dfs(newIndex, wordIndex + 1)) {
          return true
        }

        visited.delete(newIndex)
        path.pop()
      }
    }

    return false
  }

  // 尝试从每个空位置开始
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === null) {
        const startIndex = row * cols + col
        visited.add(startIndex)
        path.push(startIndex)

        if (dfs(startIndex, 1)) {
          return path
        }

        visited.delete(startIndex)
        path.pop()
      }
    }
  }

  return null
}