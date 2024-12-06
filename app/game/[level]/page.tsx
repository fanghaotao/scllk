import GameWrapper from '@/app/components/GameWrapper'

export function generateStaticParams() {
  return [
    { level: 'elementary' },
    { level: 'middle' },
    { level: 'high' },
  ]
}

export default function GamePage() {
  return <GameWrapper />
}