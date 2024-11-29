import { ProcessedPoemGroup, WordGroup } from '../types/poem'
import { indexToGridPosition } from '../utils/gridUtils'

// 检查是否完成一组
export const isCompleteGroup = (
  path: number[],
  grid: (WordGroup | null)[][],
  cols: number,
  currentPoem: ProcessedPoemGroup[]
): boolean => {
  if (path.length < 2) return false

  // 获取路径中的所有词语
  const pathWords = path.map(index => {
    const [row, col] = indexToGridPosition(index, cols)
    return grid[row][col]
  }).filter((word): word is WordGroup => word !== null)

  // 检查是否属于同一组
  const firstWord = pathWords[0]
  if (!firstWord) return false

  // 获取该组的完整句子
  const group = currentPoem.find(g => g.id === firstWord.groupId)
  if (!group) return false

  // 检查是否连接了整个句子的所有字
  if (pathWords.length !== group.words.length) return false

  // 检查组ID和顺序是否正确
  return pathWords.every((word, index) => 
    word.groupId === firstWord.groupId && 
    word.orderInGroup === index
  )
}