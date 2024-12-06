export const GAME_CONFIG = {
  POEMS_PER_STAGE: 2, // 每关包含的诗词数量
  DEFAULT_LEVEL: 'elementary' as const, // 默认难度
  COUNTDOWN_SECONDS: 2, // 倒计时秒数
  LEVELS: {
    elementary: '小学',
    middle: '初中',
    high: '高中'
  } as const
} 