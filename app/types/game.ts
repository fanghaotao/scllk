export type Difficulty = 'easy' | 'medium' | 'hard'
export type GameLevel = 'elementary' | 'middle' | 'high'

export interface GameSettings {
  difficulty: Difficulty
}

export interface WordGameProps {
  initialLevel: GameLevel
  stageId?: number
}

export interface PoemData {
  text: string
  title: string
  author: string
}

export interface ProcessedPoemGroup {
  id: number
  text: string
  chars: Array<{
    char: string
    groupId: number
    orderInGroup: number
  }>
}

export interface Connection {
  startIndex: number
  endIndex: number
  startPoint: { x: number; y: number }
  endPoint: { x: number; y: number }
}

export interface GameStats {
  score: number
  completedGroups: Set<number>
}

export interface Point {
  x: number
  y: number
}