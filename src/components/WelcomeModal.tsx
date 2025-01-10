import { useState, useEffect } from 'react'

interface WelcomeModalProps {
  onEnter: () => void
}

export default function WelcomeModal({ onEnter }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isBlinking, setIsBlinking] = useState(true)

  // Blinking effect for "Press Enter" text
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(prev => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const handleEnter = () => {
    setIsVisible(false)
    onEnter()
  }

  if (!isVisible) return null

  return (
    <div className="welcome-modal">
      <div className="modal-content">
        <h1 className="title">PixelChain</h1>
        <div className="pixel-art">
          {/* ASCII art or pixel art could go here */}
          <div className="gameboy-art">
          <pre style={{
    fontSize: '1em',
    lineHeight: 1.2,
    whiteSpace: 'pre',
    fontFamily: 'monospace',
    color: '#00ff00',
    textAlign: 'center',
    transform: 'scale(1.2)',
    margin: '0em '
  }}>{`
┌───────────────┐
│    PUMPBOY    │
│   ╔═══════╗   │
│   ║       ║   │
│   ║       ║   │
│   ╚═══════╝   │
│    ╭─────╮    │
│    │  ▲  │    │
│  ╭─┴─────┴─╮  │
│  │  ▼   ▲  │  │
│  ╰─────────╯  │
└───────────────┘
            `}</pre>
          </div>
        </div>
        <p className="subtitle">Your Retro Token Companion</p>
        <button 
          className={`enter-button ${isBlinking ? 'blink' : ''}`}
          onClick={handleEnter}
        >
          Press Enter to Start
        </button>
      </div>
    </div>
  )
}
