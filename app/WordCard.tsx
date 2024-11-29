interface WordCardProps {
  id?: string
  character: string
  groupId: number
  orderInGroup: number
  isSelected?: boolean
  isUsed?: boolean
  showHint?: boolean
  showOrder?: boolean
  onMouseDown?: () => void
  onMouseEnter?: () => void
  onTouchStart?: () => void
  className?: string
}

const WordCard = ({
  id,
  character,
  groupId,
  orderInGroup,
  isSelected = false,
  isUsed = false,
  showHint = false,
  showOrder = false,
  onMouseDown,
  onMouseEnter,
  onTouchStart,
  className = ''
}: WordCardProps) => {
  // 获取背景颜色
  const getBackgroundColor = () => {
    if (isUsed) return 'bg-gray-100'
    if (isSelected) return 'bg-blue-100'
    return 'bg-white'
  }

  // 获取边框样式
  const getBorderStyle = () => {
    if (isUsed) return 'border-gray-300'
    if (isSelected) return 'border-blue-400'
    return 'border-gray-200 hover:border-blue-300'
  }

  return (
    <div
      id={id}
      className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-lg 
        border-2 p-2 transition-all duration-200 
        ${getBackgroundColor()} ${getBorderStyle()} 
        ${isUsed ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'} 
        ${className}`}
      onMouseDown={(e) => {
        e.preventDefault()
        onMouseDown?.()
      }}
      onMouseEnter={onMouseEnter}
      onTouchStart={(e) => {
        e.preventDefault()
        onTouchStart?.()
      }}
    >
      {/* 主要字符 */}
      <span className="text-center text-gray-800">{character}</span>

      {/* 顺序提示 */}
      {showOrder && (
        <div className="absolute left-1 top-1">
          <span className="text-xs text-gray-500">{orderInGroup + 1}</span>
        </div>
      )}

      {/* 首字提示 */}
      {showHint && orderInGroup === 0 && (
        <div className="absolute right-1 top-1">
          <span className="text-xs text-blue-500">首</span>
        </div>
      )}

      {/* 已使用标记 */}
      {isUsed && (
        <div className="absolute right-1 top-1">
          <span className="text-xs text-green-500">✓</span>
        </div>
      )}

      {/* 选中状态指示器 */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg border-2 border-blue-400" />
      )}

      {/* 可访问性支持 */}
      <div className="sr-only">
        {`字符 ${character}${showOrder ? `，顺序 ${orderInGroup + 1}` : ''}${
          showHint ? '，首字' : ''
        }${isUsed ? '，已使用' : ''}${isSelected ? '，已选中' : ''}`}
      </div>
    </div>
  )
}

export default WordCard