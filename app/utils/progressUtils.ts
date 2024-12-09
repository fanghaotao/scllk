export const STORAGE_KEY = 'poem-game-progress'

interface LevelProgress {
  [key: string]: number[] // 每个难度等级已完成的关卡ID数组
}

// 获取已完成的关卡
export const getCompletedStages = (level: string): number[] => {
  try {
    const progress = localStorage.getItem(STORAGE_KEY)
    console.log('读取到的进度数据:', progress)
    
    if (!progress) {
      console.log('没有找到进度数据，返回默认值 [1]')
      return [1] // 默认解锁第一关
    }
    
    const allProgress: LevelProgress = JSON.parse(progress)
    console.log('解析后的进度数据:', allProgress)
    console.log(`${level} 等级的进度:`, allProgress[level])
    
    // 确保返回的数组包含所有已解锁的关卡
    const completedStages = allProgress[level] || [1]
    
    // 找到最大的已完成关卡，并确保下一关被解锁
    const maxCompletedStage = Math.max(...completedStages)
    if (!completedStages.includes(maxCompletedStage + 1)) {
      completedStages.push(maxCompletedStage + 1)
    }
    
    // 排序并返回
    const result = [...new Set(completedStages)].sort((a, b) => a - b)
    console.log('返回的关卡列表:', result)
    return result
  } catch (error) {
    console.error('读取进度时出错:', error)
    return [1]
  }
}

// 保存关卡完成状态
export const saveStageCompletion = (level: string, stageId: number) => {
  try {
    const progress = localStorage.getItem(STORAGE_KEY)
    console.log('保存前的进度数据:', progress)
    
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
      console.log(`已完成关卡 ${stageId} 并解锁关卡 ${stageId + 1}`)
    }
    
    // 更新并保存进度
    allProgress[level] = [...new Set(completedStages)].sort((a, b) => a - b)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress))
    
    console.log('保存后的进度:', allProgress[level])
  } catch (error) {
    console.error('保存进度时出错:', error)
  }
} 