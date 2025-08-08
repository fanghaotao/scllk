interface ScratchCardProps {
  text: string
  isCompleted: boolean
}

const ScratchCard = ({ text, isCompleted }: ScratchCardProps) => {
  return (
    <div
      className={`flex h-12 items-center justify-center rounded-lg bg-white/60 p-2 text-center transition-all duration-500 ${
        isCompleted ? 'text-green-600' : 'text-transparent'
      }`}
      style={{
        textShadow: isCompleted ? 'none' : '0 0 8px rgba(0,0,0,0.5)',
      }}
    >
      <span className="font-semibold">{text}</span>
    </div>
  )
}

export default ScratchCard