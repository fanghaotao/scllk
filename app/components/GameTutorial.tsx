'use client'
import { useState, useEffect } from 'react'

interface TutorialStep {
  title: string
  description: string
  isAnimation?: boolean
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: '游戏玩法',
    description: '通过滑动连接文字来完成古诗',
  },
  {
    title: '示例演示',
    description: '看看如何连接"鹅鹅鹅，曲项向天歌"',
    isAnimation: true
  },
  {
    title: '开始游戏',
    description: '准备好了吗？让我们开始吧！',
  }
]

const DEMO_WORDS = [ '曲', '项', '向', '天', '歌']

interface GameTutorialProps {
  onComplete: () => void
  onSkip: () => void
}

const GameTutorial = ({ onComplete, onSkip }: GameTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [connectedWords, setConnectedWords] = useState<number[]>([])
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })
  const [isDrawingLine, setIsDrawingLine] = useState(false)
  const [completedLines, setCompletedLines] = useState<Array<{
    start: { x: number, y: number },
    end: { x: number, y: number }
  }>>([])

  // 处理动画逻辑
  useEffect(() => {
    if (!TUTORIAL_STEPS[currentStep].isAnimation) {
      return
    }

    if (animationProgress >= DEMO_WORDS.length - 1) {
      // 最后一个词完成后，清除手指但保持连接状态
      setIsDrawingLine(false)
      setConnectedWords(Array.from({ length: DEMO_WORDS.length }, (_, i) => i))
      return
    }

    let wordElements = document.querySelectorAll('.word-cell')
    if (!wordElements.length) return

    const currentWord = wordElements[animationProgress] as HTMLElement
    const nextWord = wordElements[animationProgress + 1] as HTMLElement
    const container = document.querySelector('.animation-container') as HTMLElement
    
    if (!currentWord || !container) return

    // 获取容器的位置信息
    const containerRect = container.getBoundingClientRect()
    const startRect = currentWord.getBoundingClientRect()
    
    // 计算相对于容器的坐标
    const startX = startRect.left - containerRect.left + startRect.width / 2
    const startY = startRect.top - containerRect.top + startRect.height / 2

    // 设置初始手势位置
    setCursorPosition({ x: startX, y: startY })
    setIsDrawingLine(true)

    if (nextWord) {
      const endRect = nextWord.getBoundingClientRect()
      const endX = endRect.left - containerRect.left + endRect.width / 2
      const endY = endRect.top - containerRect.top + endRect.height / 2
      
      // 设置目标位置
      setTargetPosition({ x: endX, y: endY })

      // 加快动画速度：从1000ms改为600ms
      const animationDuration = 600
      const startTime = Date.now()

      const animateGesture = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / animationDuration, 1)

        const newX = startX + (endX - startX) * progress
        const newY = startY + (endY - startY) * progress

        setCursorPosition({ x: newX, y: newY })

        if (progress < 1) {
          requestAnimationFrame(animateGesture)
        } else {
          setConnectedWords(prev => [...prev, animationProgress])
          setIsDrawingLine(false)
          
          // 缩短等待时间：从300ms改为200ms
          setTimeout(() => {
            setAnimationProgress(prev => prev + 1)
          }, 200)
        }
      }

      requestAnimationFrame(animateGesture)
    }
  }, [currentStep, animationProgress])

  // 重置状态的函数
  const resetAnimationState = () => {
    setAnimationProgress(0)
    setConnectedWords([])
    setIsDrawingLine(false)
  }

  const handleNext = () => {
    if (currentStep === TUTORIAL_STEPS.length - 1) {
      setIsExiting(true)
      setTimeout(onComplete, 300)
    } else {
      setCurrentStep(prev => prev + 1)
      resetAnimationState()
    }
  }

  const handleSkip = () => {
    setIsExiting(true)
    setTimeout(onSkip, 300)
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300
      ${isExiting ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 text-center">
          <h3 className="mb-2 text-xl font-bold text-gray-800">
            {TUTORIAL_STEPS[currentStep].title}
          </h3>
          <p className="mb-4 text-gray-600">
            {TUTORIAL_STEPS[currentStep].description}
          </p>

          {/* 动画演示区域 */}
          {TUTORIAL_STEPS[currentStep].isAnimation && (
            <div className="my-8 relative animation-container">
              <div className="flex flex-wrap justify-center gap-4">
                {DEMO_WORDS.map((word, index) => (
                  <div
                    key={index}
                    className={`word-cell flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold
                      transition-all duration-300
                      ${connectedWords.includes(index) 
                        ? 'bg-blue-500 text-white transform scale-110' 
                        : 'bg-gray-100 text-gray-600'}`}
                  >
                    {word}
                  </div>
                ))}
              </div>

              {/* 手势指示器 - 只在动画进行中且不是最后一个词时显示 */}
              {isDrawingLine && animationProgress < DEMO_WORDS.length - 1 && (
                <>
                  {/* 手指图标 */}
                  <div 
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: `${cursorPosition.x}px`,
                      top: `${cursorPosition.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      👆
                    </div>
                  </div>

                  {/* 连线 */}
                  <svg 
                    className="absolute inset-0 pointer-events-none" 
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  >
                    <line
                      x1={cursorPosition.x}
                      y1={cursorPosition.y}
                      x2={targetPosition.x}
                      y2={targetPosition.y}
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeDasharray="4"
                    />
                  </svg>
                </>
              )}

              {/* 进度条 */}
              <div className="relative mt-4">
                <div 
                  className="h-1 bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${((connectedWords.length) / DEMO_WORDS.length) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 进度指示器 */}
        <div className="mb-6 flex justify-center gap-2">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors
                ${index === currentStep ? 'bg-blue-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleNext}
            className="w-full rounded-full bg-blue-500 py-3 font-medium text-white transition-colors hover:bg-blue-600"
          >
            {currentStep === TUTORIAL_STEPS.length - 1 ? '开始游戏' : '下一步'}
          </button>
          <button
            onClick={handleSkip}
            className="w-full rounded-full bg-gray-100 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            跳过教程
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameTutorial 