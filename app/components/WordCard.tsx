interface WordCardProps {
  id?: string
  character: string
  isSelected?: boolean
  isUsed?: boolean
  showHint?: boolean
  showOrder?: boolean
  orderInGroup?: number
  onMouseDown?: () => void
  onMouseEnter?: () => void
  onTouchStart?: () => void
}

const WordCard = ({
  id,
  character,
  isSelected = false,
  isUsed = false,
  showHint = false,
  showOrder = false,
  orderInGroup,
  onMouseDown,
  onMouseEnter,
  onTouchStart,
}: WordCardProps) => {
  const stateClasses = isUsed
    ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
    : isSelected
    ? 'bg-blue-200 border-blue-400 transform -translate-y-1'
    : 'bg-white border-gray-300 hover:border-blue-400 hover:-translate-y-1'

  return (
    <div
      id={id}
      className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-lg border-b-4 p-1 transition-all duration-150 ${stateClasses}`}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onTouchStart={onTouchStart}
    >
      <span className="text-2xl font-bold sm:text-3xl md:text-4xl">
        {character}
      </span>

      {showOrder && orderInGroup !== undefined && !isUsed && (
        <div className="absolute left-1 top-0 text-xs font-medium text-gray-400">
          {orderInGroup + 1}
        </div>
      )}

      {showHint && !isUsed && (
        <div className="absolute right-1 top-0 text-xs font-bold text-blue-500">
          首
        </div>
      )}

      {isUsed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <span className="material-icons text-4xl text-white">check_circle</span>
        </div>
      )}
    </div>
  )
}

export default WordCard