'use client'
import { useEffect, useRef } from 'react'

interface BubbleMaskProps {
  char: string
  isVisible: boolean
}

const BubbleMask = ({ char, isVisible }: BubbleMaskProps) => {
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bubbleRef.current) return

    const bubble = bubbleRef.current
    const duration = 2000 + Math.random() * 2000 // 2-4秒随机动画时长
    const delay = Math.random() * 1000 // 0-1秒随机延迟

    bubble.style.animationDuration = `${duration}ms`
    bubble.style.animationDelay = `${delay}ms`
  }, [])

  if (!isVisible) return null

  return (
    <div
      ref={bubbleRef}
      className="bubble-mask inline-block w-[1em] animate-float select-none text-center"
      style={{
        opacity: Math.random() * 0.3 + 0.7, // 随机透明度 0.7-1
      }}
    >
      <span className="text-gray-400">○</span>
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        .bubble-mask {
          animation: float infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default BubbleMask