import { WordGroup } from '../types/poem'

export const findOptimalArrangement = (
  words: WordGroup[],
): { grid: (WordGroup | null)[][]; rows: number; cols: number } => {
  if (words.length === 0) {
    return { grid: [], rows: 0, cols: 0 }
  }

  // 1. Determine grid dimensions
  const totalChars = words.length
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const baseCols = isMobile ? 4 : 5
  const cols = Math.min(baseCols, Math.max(3, Math.ceil(Math.sqrt(totalChars))))
  
  // 2. Group words by their poem line
  const groups = Object.values(
    words.reduce((acc, word) => {
      if (!acc[word.groupId]) acc[word.groupId] = []
      acc[word.groupId].push(word)
      return acc
    }, {} as Record<number, WordGroup[]>)
  )

  // Sort each group by orderInGroup just in case
  groups.forEach(g => g.sort((a, b) => a.orderInGroup - b.orderInGroup))
  // Sort groups by length, longest first, for better packing
  groups.sort((a, b) => b.length - a.length)

  // 3. Place groups into the grid
  const grid: (WordGroup | null)[][] = []
  let currentRow = 0
  let currentCol = 0

  groups.forEach(group => {
    if (grid[currentRow] === undefined) {
      grid[currentRow] = Array(cols).fill(null)
    }

    // If group doesn't fit in the current row, move to the next
    if (currentCol + group.length >= cols) {
      currentRow++
      currentCol = 0
    }
    
    if (grid[currentRow] === undefined) {
      grid[currentRow] = Array(cols).fill(null)
    }

    // Place the group
    group.forEach(word => {
      grid[currentRow][currentCol] = word
      currentCol++
    })

    // Add a space after the group
    currentCol++
  })

  // 4. Shuffle the words within the final grid for randomness
  const flatWords = grid.flat().filter((w): w is WordGroup => w !== null)
  for (let i = flatWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flatWords[i], flatWords[j]] = [flatWords[j], flatWords[i]]
  }

  // 5. Place shuffled words back into a new grid
  const finalGrid: (WordGroup | null)[][] = []
  let wordIndex = 0
  for (let r = 0; r < grid.length; r++) {
    finalGrid[r] = Array(cols).fill(null)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== null && wordIndex < flatWords.length) {
        finalGrid[r][c] = flatWords[wordIndex++]
      }
    }
  }

  return { grid: finalGrid, rows: finalGrid.length, cols }
}