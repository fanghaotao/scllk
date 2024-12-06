export const STORAGE_KEY = 'poem-game-progress'

interface LevelProgress {
  [key: string]: number[] // 每个难度等级已完成的关卡ID数组
}

// 获取已完成的关卡
export const getCompletedStages = (level: string): number[] => {
  try {
    const progress = localStorage.getItem(STORAGE_KEY)
    if (!progress) return [1] // 默认解锁第一关
    
    const allProgress: LevelProgress = JSON.parse(progress)
    return allProgress[level] || [1]
  } catch (error) {
    console.error('Error loading progress:', error)
    return [1]
  }
}

// 保存关卡完成状态
export const saveStageCompletion = (level: string, stageId: number) => {
  try {
    const progress = localStorage.getItem(STORAGE_KEY)
    const allProgress: LevelProgress = progress ? JSON.parse(progress) : {}
    
    // 获取当前等级的已完成关卡
    const completedStages = allProgress[level] || [1]
    
    // 如果关卡尚未记录为完成，则添加
    if (!completedStages.includes(stageId)) {
      completedStages.push(stageId)
      // 解锁下一关
      if (!completedStages.includes(stageId + 1)) {
        completedStages.push(stageId + 1)
      }
    }
    
    // 更新并保存进度
    allProgress[level] = [...new Set(completedStages)].sort((a, b) => a - b)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress))
  } catch (error) {
    console.error('Error saving progress:', error)
  }
} 