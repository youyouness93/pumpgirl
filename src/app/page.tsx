'use client'

import { useState, useRef, useEffect } from 'react'
import GameBoy from '@/components/GameBoy'
import TokenMonitor from '@/components/TokenMonitor'
import WelcomeModal from '@/components/WelcomeModal'
import RetroBackground from '@/components/RetroBackground'
import InfoCards from '@/components/InfoCards'
import TokenTable, { Token } from '@/components/TokenTable'
import Banner from '@/components/Banner'

export default function Home() {
  const [isMuted, setIsMuted] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [showModal, setShowModal] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [filters, setFilters] = useState({
    minMarketCap: 0,
    minInitialBuy: 0,
    description: ''
  })

  const handleEnterApp = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/The Adventures of Star Saver OST - Stage 1.mp3')
      audioRef.current.loop = true
      audioRef.current.volume = 0.5
    }
    audioRef.current.play()
    setShowModal(false)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const handleLoadingComplete = () => {
    console.log('Loading complete');
  }

  useEffect(() => {
    console.log('Current tokens in state:', tokens);
  }, [tokens]);

  return (
    <main className="min-h-screen flex flex-col bg-black">
      {/* Background with reduced opacity */}
      <div className="fixed inset-0 opacity-30">
        <RetroBackground />
      </div>
      
      {/* Main content container */}
      <div className="relative flex flex-col min-h-screen">
        {/* Banner */}
        <Banner isMuted={isMuted} onToggleMute={toggleMute} />
        
        {/* Content */}
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="lg:sticky lg:top-8">
              <GameBoy>
                <TokenMonitor
                  isMonitoring={isMonitoring}
                  setIsMonitoring={setIsMonitoring}
                  filters={filters}
                  setFilters={setFilters}
                  onLoadingComplete={handleLoadingComplete}
                  onNewToken={(token) => setTokens(prev => [...prev, token])}
                />
              </GameBoy>
            </div>
            
            <div className="flex-1 bg-black/90 p-6 rounded-lg border border-[#00ff00]/20">
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                <InfoCards />
              </div>
              <TokenTable 
                tokens={tokens}
                isMonitoring={isMonitoring}
                filters={filters}
                onStop={() => {
                  console.log('Stopping token monitoring...');
                  setIsMonitoring(false);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Modal */}
      {showModal && (
        <WelcomeModal onEnter={handleEnterApp} />
      )}
    </main>
  )
}
