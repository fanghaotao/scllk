interface LevelConfig {
  name: string;
  totalStages: number;
}

export const GAME_CONFIG = {
  POEMS_PER_STAGE: 1, // 每关包含的诗词数量
  DEFAULT_LEVEL: 'elementary' as const, // 默认难度
  COUNTDOWN_SECONDS: 1, // 倒计时秒数
  LEVELS: {
    elementary: {
      name: '小学',
      totalStages: 20
    },
    middle: {
      name: '初中',
      totalStages: 30
    },
    high: {
      name: '高中',
      totalStages: 40
    }
  } as const
} 

// 导出类型
export type GameLevel = keyof typeof GAME_CONFIG.LEVELS; 