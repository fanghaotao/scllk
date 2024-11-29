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
    const sqrt = Math.sqrt(total)
    const rows = Math.ceil(sqrt)
    const cols = Math.ceil(total / rows)
    return { rows, cols }
  }

  const { rows: initialRows, cols } = getGridDimensions(totalWords)
  
  const grid: (WordGroup | null)[][] = []
  for (let i = 0; i < initialRows; i++) {
    grid[i] = Array(cols).fill(null)
  }

  const groupedWords = words.reduce((acc, word) => {
    if (!acc[word.groupId]) {
      acc[word.groupId] = []
    }
    acc[word.groupId].push(word)
    return acc
  }, {} as Record<number, WordGroup[]>)

  let currentRow = 0
  let currentCol = 0

  Object.values(groupedWords).forEach(group => {
    if (currentCol + group.length > cols) {
      currentRow++
      currentCol = 0
    }

    if (currentRow >= grid.length) {
      const newRow = Array(cols).fill(null)
      grid.push(newRow)
    }

    group.forEach(word => {
      if (currentRow < grid.length && currentCol < cols) {
        grid[currentRow][currentCol] = word
        currentCol++
      }
    })

    currentCol++
    if (currentCol >= cols) {
      currentRow++
      currentCol = 0
    }
  })

  return {
    grid,
    rows: grid.length,
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