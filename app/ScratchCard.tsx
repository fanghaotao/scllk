'use client'
import { useEffect, useRef } from 'react'

interface ScratchCardProps {
  text: string
  isCompleted: boolean
  groupId: number
}

const ScratchCard = ({ text, isCompleted, groupId }: ScratchCardProps) => {
  const maskRef = useRef<HTMLDivElement>(null)
  const animationStartedRef = useRef(false)

  useEffect(() => {
    console.log(`ScratchCard ${groupId} effect - isCompleted:`, isCompleted)

    if (isCompleted && !animationStartedRef.current && maskRef.current) {
      console.log(`Starting animation for group ${groupId}`)
      animationStartedRef.current = true

      // 添加动画类
      maskRef.current.classList.add('animate-scratch')
      
      // 动画结束后移除遮罩
      maskRef.current.addEventListener('animationend', () => {
        console.log(`Animation completed for group ${groupId}`)
        if (maskRef.current) {
          maskRef.current.style.display = 'none'
        }
      }, { once: true })
    }
  }, [isCompleted, groupId])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md">
      {/* 背景文字 */}
      <div 
        className={`absolute inset-0 flex items-center justify-center bg-white p-2 text-center
          ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}
      >
        <span className="text-lg font-medium">{text}</span>
      </div>
      
      {/* 遮罩层 */}
      {!isCompleted && (
        <div 
          ref={maskRef}
          className="absolute inset-0 bg-gray-200"
          style={{
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 添加动画样式 */}
      <style jsx>{`
        @keyframes scratch {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate-scratch {
          animation: scratch 1s ease-in-out forwards;
        }
      `}</style>
    </div>
  )
}

export default ScratchCard