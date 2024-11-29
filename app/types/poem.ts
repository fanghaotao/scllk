// 单个字/词的数据结构
export interface WordGroup {
    word: string
    groupId: number
    orderInGroup: number
  }
  
  // 诗词原始数据
  export interface PoemData {
    text: string
    title?: string
    author?: string
  }
  
  // 处理后的诗句组
  export interface ProcessedPoemGroup {
    id: number
    text: string
    words: WordGroup[]
    title?: string
    author?: string
  }
  
  // 组进度
  export interface GroupProgress {
    groupId: number
    completedWords: Set<number>  // 存储已完成的字的顺序
    totalWords: number          // 该组总字数
  }