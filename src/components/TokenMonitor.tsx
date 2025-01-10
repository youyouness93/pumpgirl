import React, { useState, useEffect, useCallback } from 'react';
import { Token } from './TokenTable';

interface TokenData {
  name: string;
  symbol: string;
  supply: number;
  marketCap: number;
  age: number;
  tags: string[];
}

interface TokenMonitorProps {
  isMonitoring: boolean;
  setIsMonitoring: (value: boolean) => void;
  filters: {
    minMarketCap: number;
    maxInitialBuy: number;
    description: string;
    tags: string;
    requiredLinks: {
      twitter: boolean;
      telegram: boolean;
      website: boolean;
    };
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    minMarketCap: number;
    maxInitialBuy: number;
    description: string;
    tags: string;
    requiredLinks: {
      twitter: boolean;
      telegram: boolean;
      website: boolean;
    };
  }>>;
  onNewToken: (token: Token) => void;
  onLoadingComplete: () => void;
}

const TokenMonitor: React.FC<TokenMonitorProps> = ({
  isMonitoring,
  setIsMonitoring,
  filters,
  setFilters,
  onNewToken,
  onLoadingComplete
}) => {
  const [currentStep, setCurrentStep] = useState<'loading' | 'explanation' | 'marketCap' | 'initialSupply' | 'links' | 'tags' | 'final'>('loading')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Form state
  const [marketCap, setMarketCap] = useState<number>(0)
  const [initialSupply, setInitialSupply] = useState<number>(0)
  const [tags, setTags] = useState<string>('')
  const [requiredLinks, setRequiredLinks] = useState({
    twitter: false,
    telegram: false,
    website: false
  })

  useEffect(() => {
    if (currentStep === 'loading') {
      const timer = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setCurrentStep('explanation');
            onLoadingComplete();
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(timer);
    }
  }, [currentStep, onLoadingComplete]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(num);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleStartMonitoring = () => {
    setIsMonitoring(true);
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
  };

  const handleNextStep = useCallback(() => {
    setIsTransitioning(true)
    setTimeout(() => {
      switch (currentStep) {
        case 'loading':
          setCurrentStep('explanation')
          break
        case 'explanation':
          setCurrentStep('marketCap')
          break
        case 'marketCap':
          setCurrentStep('initialSupply')
          break
        case 'initialSupply':
          setCurrentStep('links')
          break
        case 'links':
          setCurrentStep('tags')
          break
        case 'tags':
          setCurrentStep('final')
          setFilters(prev => ({
            ...prev,
            requiredLinks
          }))
          break
        default:
          break
      }
      setIsTransitioning(false)
    }, 300)
  }, [currentStep, requiredLinks, setFilters])

  useEffect(() => {
    if (currentStep === 'loading') {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            onLoadingComplete()
            setTimeout(handleNextStep, 500)
            return 100
          }
          return prev + 1
        })
      }, 30)
      return () => clearInterval(interval)
    }
  }, [currentStep, onLoadingComplete, handleNextStep])

  const renderContent = () => {
    switch (currentStep) {
      case 'loading':
        return (
          <div className="screen-container">
            <div className="loading-container">
              <div className="pixel-icon">
                <div className="pixel-cartridge spinning-cartridge"></div>
              </div>
              <h2 className="retro-title">LOADING GAME...</h2>
              <div className="loading-bar">
                <div 
                  className="loading-progress"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="font-pixel text-xs opacity-70">{loadingProgress}%</div>
            </div>
          </div>
        );

      case 'explanation':
        return (
          <div className="screen-container">
            <div className="pixel-icon">
              <div className="pixel-settings"></div>
            </div>
            <h2 className="retro-title">FILTER SETUP</h2>
            <div className="input-container">
              <div className="value-display">
                <div className="filter-item">
                  <span className="filter-label">1. MARKET CAP</span>
                </div>
                <div className="filter-item">
                  <span className="filter-label">2. INITIAL BUY</span>
                </div>
                <div className="filter-item">
                  <span className="filter-label">3. LINKS</span>
                </div>
                <div className="filter-item">
                  <span className="filter-label">4. TAGS</span>
                </div>
              </div>
              <button 
                onClick={handleNextStep}
                className="retro-button mt-6"
              >
                START SETUP →
              </button>
            </div>
          </div>
        );

      case 'marketCap':
        return (
          <div className="screen-container">
            <div className="pixel-icon">
              <div className="pixel-coin"></div>
            </div>
            <h2 className="retro-title">SET MIN MARKET CAP</h2>
            <div className="input-container">
              <div className="value-display">
                <span>MCAP</span>
                <span>${marketCap >= 1000 ? `${(marketCap/1000).toFixed(0)}K` : marketCap} USD</span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={marketCap}
                onChange={(e) => setMarketCap(Number(e.target.value))}
                className="gameboy-slider"
              />
              <button 
                onClick={() => {
                  setFilters(prev => ({ ...prev, minMarketCap: marketCap }));
                  handleNextStep();
                }}
                className="retro-button mt-6"
              >
                NEXT →
              </button>
            </div>
          </div>
        );

      case 'initialSupply':
        return (
          <div className="screen-container">
            <div className="pixel-icon">
              <div className="pixel-lightning"></div>
            </div>
            <h2 className="retro-title">SET MAX INITIAL BUY "sol"</h2>
            <div className="input-container">
              <div className="value-display">
                <span>BUY</span>
                <span>{initialSupply} SOL</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={initialSupply}
                onChange={(e) => setInitialSupply(Number(e.target.value))}
                className="gameboy-slider"
              />
              <button 
                onClick={() => {
                  setFilters(prev => ({ ...prev, maxInitialBuy: initialSupply }));
                  handleNextStep();
                }}
                className="retro-button mt-6"
              >
                NEXT →
              </button>
            </div>
          </div>
        );

      case 'links':
        return (
          <div className="screen-container">
            <div className="pixel-icon">
              <div className="pixel-link"></div>
            </div>
            <h2 className="retro-title">REQUIRED LINKS</h2>
            <div className="input-container">
              <div className="value-display">
                <div className="link-option">
                  <input
                    type="checkbox"
                    id="twitter"
                    checked={requiredLinks.twitter}
                    onChange={(e) => setRequiredLinks(prev => ({
                      ...prev,
                      twitter: e.target.checked
                    }))}
                    className="gameboy-checkbox"
                  />
                  <label htmlFor="twitter" className="font-pixel" title="Twitter">X</label>
                </div>
                
                <div className="link-option">
                  <input
                    type="checkbox"
                    id="telegram"
                    checked={requiredLinks.telegram}
                    onChange={(e) => setRequiredLinks(prev => ({
                      ...prev,
                      telegram: e.target.checked
                    }))}
                    className="gameboy-checkbox"
                  />
                  <label htmlFor="telegram" className="font-pixel" title="Telegram">▲</label>
                </div>
                
                <div className="link-option">
                  <input
                    type="checkbox"
                    id="website"
                    checked={requiredLinks.website}
                    onChange={(e) => setRequiredLinks(prev => ({
                      ...prev,
                      website: e.target.checked
                    }))}
                    className="gameboy-checkbox"
                  />
                  <label htmlFor="website" className="font-pixel" title="Website">○</label>
                </div>
              </div>
              <button 
                onClick={handleNextStep}
                className="retro-button mt-6"
              >
                NEXT →
              </button>
            </div>
          </div>
        );

      case 'tags':
        return (
          <div className="screen-container">
            <div className="pixel-icon">
              <div className="pixel-tag"></div>
            </div>
            <h2 className="retro-title">ADD TOKEN TAGS</h2>
            <div className="input-container">
              <div className="tags-input-container">
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="MEME,AI,DEFI"
                  className="tags-input"
                />
              </div>
              <button 
                onClick={() => {
                  setFilters(prev => ({ ...prev, description: tags }));
                  setIsMonitoring(true);
                  handleNextStep();
                }}
                className="retro-button mt-6"
              >
                START MONITORING →
              </button>
            </div>
          </div>
        );

      case 'final':
        return (
          <div className="screen-container">
            <div className="pixel-icon">
              <div className="pixel-lightning"></div>
            </div>
            <h2 className="retro-title">MONITORING ACTIVE</h2>
            <div className="input-container">
              <div className="value-display">
                <span>CHECK YOUR TOKENS ON THE TABLE bellow ...</span>
              </div>
              <button 
                onClick={() => {
                  setCurrentStep('explanation');
                  setIsMonitoring(false);
                }}
                className="retro-button mt-6"
              >
                RESTART
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="token-monitor">
      {renderContent()}
    </div>
  )
}

export default TokenMonitor;
