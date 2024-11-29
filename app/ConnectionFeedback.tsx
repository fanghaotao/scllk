import { FC, useEffect, useState } from 'react'
import { WordGroup } from './types/poem'

interface ConnectionFeedbackProps {
  currentPath: number[]
  shuffledChars: Array<{
    char: string
    groupId: number
    orderInGroup: number
  }>
  poemGroups: WordGroup[]
  showHints: boolean
}

const ConnectionFeedback: FC<ConnectionFeedbackProps> = ({
  currentPath,
  shuffledChars,
  poemGroups,
  showHints
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState('')

  useEffect(() => {
    if (!showHints || currentPath.length === 0) {
      setFeedbackMessage('')
      return
    }

    const groupId = shuffledChars[currentPath[0]]?.groupId
    const group = poemGroups.find(g => g.id === groupId)
    if (group) {
      setFeedbackMessage(`正在连接: ${group.text}`)
    }
  }, [currentPath, showHints, shuffledChars, poemGroups])

  if (!feedbackMessage) return null

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 transform">
      <div className="rounded-md bg-blue-100 px-4 py-2 text-sm text-blue-800 shadow-md">
        {feedbackMessage}
      </div>
    </div>
  )
}

export default ConnectionFeedback