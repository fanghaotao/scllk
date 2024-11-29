"use client"
import dynamic from 'next/dynamic'

const WordGameClient = dynamic(() => import('./WordGame.client'), {
  ssr: false
})

const WordGame = () => {
  return <WordGameClient />
}

export default WordGame