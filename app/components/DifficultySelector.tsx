import { Difficulty } from '../types/game'

interface DifficultySelectorProps {
  currentDifficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
}

const DifficultySelector = ({
  currentDifficulty,
  onDifficultyChange
}: DifficultySelectorProps) => {
  return (
    <div className="mb-6 flex items-center justify-center gap-4">
      <button
        onClick={() => onDifficultyChange('easy')}
        className={`rounded-full px-6 py-2 text-sm font-medium transition-colors
          ${currentDifficulty === 'easy'
            ? 'bg-green-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
      >
        初级
      </button>
      <button
        onClick={() => onDifficultyChange('medium')}
        className={`rounded-full px-6 py-2 text-sm font-medium transition-colors
          ${currentDifficulty === 'medium'
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
      >
        中级
      </button>
      <button
        onClick={() => onDifficultyChange('hard')}
        className={`rounded-full px-6 py-2 text-sm font-medium transition-colors
          ${currentDifficulty === 'hard'
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
      >
        高级
      </button>
    </div>
  )
}

export default DifficultySelector