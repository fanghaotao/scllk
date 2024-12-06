"use client"
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const WordGameClient = dynamic(() => import('../WordGame.client'), {
  ssr: false
})

export default function GameWrapper() {
  const params = useParams()
  const level = params.level as string

  return <WordGameClient initialLevel={level} />
}