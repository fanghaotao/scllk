'use client'
import { useEffect, useRef } from 'react'
import BubbleMask from './BubbleMask'

interface ScratchCardProps {
  text: string
  maskedText: string
  isCompleted: boolean
  groupId: number
}

const ScratchCard = ({ text, maskedText, isCompleted, groupId }: ScratchCardProps) => {
  const maskRef = useRef<HTMLDivElement>(null)
  const animationStartedRef = useRef(false)

  useEffect(() => {
    if (isCompleted && !animationStartedRef.current && maskRef.current) {
      animationStartedRef.current = true
      maskRef.current.classList.add('animate-reveal')
    }
  }, [isCompleted, groupId])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md">
      {/* 背景文字 */}
      <div className={`absolute inset-0 flex items-center justify-center bg-white p-2 text-center
        ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}
      >
        <span className="text-sm font-medium sm:text-base">{text}</span>
      </div>
      
      {/* 遮罩层文字 */}
      {!isCompleted && (
        <div 
          ref={maskRef}
          className="absolute inset-0 flex items-center justify-center bg-gray-100 p-2 text-center"
        >
          <div className="flex items-center justify-center space-x-1">
            {Array.from(text).map((char, index) => {
              const shouldMask = maskedText[index] === '█'
              return (
                <div key={index} className="relative">
                  {shouldMask ? (
                    <BubbleMask char={char} isVisible={true} />
                  ) : (
                    <span className="text-sm font-medium text-gray-600 sm:text-base">
                      {char}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 添加动画样式 */}
      <style jsx>{`
        @keyframes reveal {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
        
        .animate-reveal {
          animation: reveal 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default ScratchCard