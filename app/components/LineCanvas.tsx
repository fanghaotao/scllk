"use client"
import { useEffect, useRef } from 'react'

interface Point {
  x: number
  y: number
}

interface LineCanvasProps {
  lines: Array<[Point, Point]> // 已确认的连线
  currentPath?: Point[] // 当前正在绘制的路径
  className?: string
}

const LineCanvas = ({ lines, currentPath, className = '' }: LineCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 设置canvas尺寸为父元素的实际尺寸
    const parent = canvas.parentElement
    if (parent) {
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制已确认的线条
    ctx.strokeStyle = '#3b82f6' // blue-500
    ctx.lineWidth = 2
    lines.forEach(([start, end]) => {
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    })

    // 绘制当前路径
    if (currentPath && currentPath.length > 1) {
      ctx.strokeStyle = '#60a5fa' // blue-400
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(currentPath[0].x, currentPath[0].y)
      
      // 绘制路径中的所有点
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y)
      }
      
      ctx.stroke()
    }
  }, [lines, currentPath])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  )
}

export default LineCanvas