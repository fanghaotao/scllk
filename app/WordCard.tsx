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
  onMouseEnter
}: WordCardProps) => {
  // 根据状态确定背景颜色
  const getBackgroundColor = () => {
    if (isUsed) return 'bg-green-100 text-green-800'
    if (isSelected) return 'bg-blue-100 text-blue-800'
    if (showHint) return 'bg-yellow-50 text-yellow-800'
    return 'bg-white text-gray-800'
  }

  // 根据状态确定边框样式
  const getBorderStyle = () => {
    if (isUsed) return 'border-green-200'
    if (isSelected) return 'border-blue-200'
    if (showHint) return 'border-yellow-200'
    return 'border-gray-200'
  }

  return (
    <div
      id={id}
      className={`
        relative aspect-square w-full cursor-pointer select-none rounded-lg
        border-2 p-2 shadow-sm transition-all duration-200
        hover:shadow-md
        ${getBackgroundColor()}
        ${getBorderStyle()}
        ${isUsed ? 'cursor-default' : 'hover:scale-105'}
      `}
      onMouseDown={!isUsed ? onMouseDown : undefined}
      onMouseEnter={!isUsed ? onMouseEnter : undefined}
    >
      {/* 主要字符 */}
      <div className="flex h-full items-center justify-center">
        <span className="text-2xl font-medium">{character}</span>
      </div>

      {/* 顺序提示 - 仅在 showOrder 为 true 且未使用时显示 */}
      {showOrder && !isUsed && (
        <div className="absolute left-1 top-1">
          <span className="text-xs text-gray-400">{orderInGroup + 1}</span>
        </div>
      )}

      {/* 首字提示 - 仅在 showHint 为 true 且未使用时显示 */}
      {/* {showHint && !isUsed && (
        <div className="absolute right-1 top-1">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-100 text-[10px] text-yellow-800">
            首
          </span>
        </div>
      )} */}

      {/* 已使用标记 */}
      {isUsed && (
        <div className="absolute right-1 top-1">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-[10px] text-green-800">
            ✓
          </span>
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