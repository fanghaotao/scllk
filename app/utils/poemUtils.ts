import { PoemData, ProcessedPoemGroup, WordGroup } from '../types/poem'

// 获取随机诗句
export const getRandomPoem = (poems: PoemData[]): PoemData => {
  if (!poems.length) {
    throw new Error('诗句列表为空')
  }
  const randomIndex = Math.floor(Math.random() * poems.length)
  return poems[randomIndex]
}

// 将诗句文本分割成组
export const processPoem = (text: string): ProcessedPoemGroup[] => {
  const sentences = text.split(/[，。？！；：、]/g).filter(s => s.trim().length > 0)
  
  return sentences.map((sentence, index) => {
    const chars = Array.from(sentence).map((char, charIndex) => ({
      word: char,
      groupId: index,
      orderInGroup: charIndex
    }))

    return {
      id: index,
      text: sentence,
      words: chars
    }
  })
}