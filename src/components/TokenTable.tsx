import React, { useState, useEffect, useRef } from 'react';
import { FaTelegram, FaGlobe } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export interface Token {
  name: string;
  symbol: string;
  initialBuy: number;
  marketCap: number;
  creationDate: string;
  caAddress: string;
  volume: number;
  twitter?: string;
  telegram?: string;
  website?: string;
  lastUpdate?: number;  // timestamp de la dernière mise à jour
}

interface TokenTableProps {
  tokens?: Token[];
  onStop?: () => void;
  filters: {
    minMarketCap: number;
    maxInitialBuy: number;
    tags: string;
    description: string;
    requiredLinks: {
      twitter: boolean;
      telegram: boolean;
      website: boolean;
    };
  };
  isMonitoring: boolean;
}

interface DexScreenerData {
  marketCap: number;
  volumeH1: number;
  pairCreatedAt: number;
}

const TokenTable: React.FC<TokenTableProps> = ({ tokens: initialTokens = [], onStop, filters = {
  minMarketCap: 0,
  maxInitialBuy: 100,
  tags: '',
  description: '',
  requiredLinks: {
    twitter: false,
    telegram: false,
    website: false
  }
}, isMonitoring }) => {
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const wsRef = useRef<WebSocket | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const SOL_PRICE_USD = 104.20;

  // Structure pour suivre les tokens en cours de surveillance
  interface WatchingToken {
    token: Partial<Token>;
    startTime: number;
    intervalId: NodeJS.Timeout;
  }
  
  const watchingTokens = new Map<string, WatchingToken>();

  const startWatchingToken = async (data: any, metadata: any, solAmount: number) => {
    const caAddress = data.mint;
    
    // Si on surveille déjà ce token, ne pas recommencer
    if (watchingTokens.has(caAddress)) {
      return;
    }

    // Vérifier les liens requis
    if (!checkRequiredLinks(metadata)) {
      console.log(`Token ${data.symbol} rejected: missing required links`);
      return;
    }

    console.log(`Starting to watch token ${data.symbol} (${caAddress})`);
    
    const newWatchingToken: Partial<Token> = {
      name: data.name || 'Unknown',
      symbol: data.symbol || 'N/A',
      initialBuy: solAmount * SOL_PRICE_USD,
      caAddress: caAddress,
      twitter: metadata?.twitter || undefined,
      telegram: metadata?.telegram || undefined,
      website: metadata?.website || undefined,
    };

    // Créer un intervalle pour ce token spécifique
    const intervalId = setInterval(async () => {
      try {
        const dexData = await fetchDexScreenerData(caAddress);
        if (dexData) {
          console.log(`DexScreener update for watching token ${data.symbol}:`, {
            marketCap: dexData.marketCap,
            required: filters.minMarketCap,
            createdAt: formatCreationDate(dexData.pairCreatedAt)
          });

          // Si le marketCap atteint le minimum requis
          if (dexData.marketCap >= filters.minMarketCap) {
            console.log(`Token ${data.symbol} reached required marketCap!`);
            
            // Créer le token complet
            const newToken: Token = {
              ...newWatchingToken as Token,
              marketCap: dexData.marketCap,
              volume: dexData.volumeH1,
              creationDate: formatCreationDate(dexData.pairCreatedAt),
              lastUpdate: Date.now()
            };

            // Ajouter à la table
            setTokens(prevTokens => {
              const updatedTokens = [...prevTokens, newToken].slice(-100);
              return updatedTokens;
            });

            // Arrêter la surveillance intensive
            clearInterval(intervalId);
            watchingTokens.delete(caAddress);
            console.log(`Stopped watching ${data.symbol} - added to table`);
          }
        }
      } catch (error) {
        console.error(`Error watching ${data.symbol}:`, error);
      }
    }, 2000);

    // Ajouter à la liste des tokens surveillés
    watchingTokens.set(caAddress, {
      token: newWatchingToken,
      startTime: Date.now(),
      intervalId: intervalId
    });

    // Mettre en place le timeout de 10 minutes
    setTimeout(() => {
      const watchingToken = watchingTokens.get(caAddress);
      if (watchingToken) {
        clearInterval(watchingToken.intervalId);
        watchingTokens.delete(caAddress);
        console.log(`Stopped watching ${data.symbol} after 10 minutes timeout`);
      }
    }, 10 * 60 * 1000);
  };

  const startMonitoring = () => {
    try {
      console.log('Trying to connect to WebSocket...');
      const ws = new WebSocket('wss://pumpportal.fun/api/data');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket Connected');
        const payload = {
          method: "subscribeNewToken"
        };
        ws.send(JSON.stringify(payload));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.txType === 'create') {
            const solAmount = Number(data.solAmount || 0);
            
            // 1. Vérifier maxInitialBuy
            if (!checkInitialBuy(solAmount)) {
              return;
            }
            
            // 2. Vérifier les tags dans l'URI
            const metadata = await fetchMetadata(data.uri);
            if (!checkDescription(metadata)) {
              return;
            }

            // 3. Commencer à surveiller ce token
            startWatchingToken(data, metadata, solAmount);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket Disconnected:', event.code, event.reason);
        // Tenter de se reconnecter après 5 secondes
        setTimeout(() => {
          if (isMonitoring) {  // Ne se reconnecte que si on est toujours en mode monitoring
            console.log('Attempting to reconnect...');
            startMonitoring();
          }
        }, 5000);
      };

    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  };

  const stopMonitoring = () => {
    // Arrêter le WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Arrêter toutes les surveillances en cours
    watchingTokens.forEach((watchingToken, address) => {
      clearInterval(watchingToken.intervalId);
      console.log(`Stopped watching ${watchingToken.token.symbol}`);
    });
    watchingTokens.clear();
    
    // Arrêter les mises à jour DexScreener
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
      console.log('DexScreener updates stopped');
    }
    
    if (onStop) onStop();
  };

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring();
      // Démarrer les mises à jour en temps réel
      startRealTimeUpdates();
    } else {
      stopMonitoring();
      // Arrêter les mises à jour en temps réel
      stopRealTimeUpdates();
    }
    
    // Cleanup function
    return () => {
      stopRealTimeUpdates();
    };
  }, [isMonitoring]);

  const startRealTimeUpdates = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    updateIntervalRef.current = setInterval(async () => {
      console.log('Starting DexScreener updates...');
      const updatedTokens = [...tokens];
      let hasUpdates = false;
      
      for (let i = 0; i < updatedTokens.length; i++) {
        try {
          console.log(`Fetching DexScreener data for ${updatedTokens[i].symbol}...`);
          const dexData = await fetchDexScreenerData(updatedTokens[i].caAddress);
          if (dexData) {
            console.log(`DexScreener update for ${updatedTokens[i].symbol}:`, {
              oldMarketCap: updatedTokens[i].marketCap,
              newMarketCap: dexData.marketCap,
              oldVolume: updatedTokens[i].volume,
              newVolume: dexData.volumeH1
            });
            
            // Ne mettre à jour que si les valeurs ont changé
            if (dexData.marketCap !== updatedTokens[i].marketCap || 
                dexData.volumeH1 !== updatedTokens[i].volume) {
              hasUpdates = true;
              updatedTokens[i] = {
                ...updatedTokens[i],
                marketCap: dexData.marketCap,
                volume: dexData.volumeH1,
                lastUpdate: Date.now()
              };
            }
          }
        } catch (error) {
          console.error(`Error updating ${updatedTokens[i].symbol}:`, error);
        }
      }
      
      if (hasUpdates) {
        setTokens(updatedTokens);
      }
    }, 2000); // Mise à jour toutes les 2 secondes
  };

  const stopRealTimeUpdates = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  const checkMarketCap = (marketCapSol: number): boolean => {
    // marketCapSol est en SOL dans les données brutes
    return marketCapSol >= (filters.minMarketCap || 0);
  };

  const checkInitialBuy = (solAmount: number): boolean => {
    // solAmount est déjà en SOL dans les données brutes
    console.log(`Checking initialBuy: amount=${solAmount} SOL, max=${filters.maxInitialBuy} SOL`);
    return solAmount <= (filters.maxInitialBuy || Infinity);
  };

  const checkDescription = (metadata: any): boolean => {
    if (!filters.description || filters.description === '') return true;
    
    const description = metadata?.description?.toLowerCase() || '';
    const searchTerms = filters.description.toLowerCase().split(',').map(term => term.trim());
    
    // Vérifie si AU MOINS UN des tags est dans la description (OR)
    return searchTerms.some(term => description.includes(term));
  };

  const checkRequiredLinks = (metadata: any): boolean => {
    if (!filters.requiredLinks) return true;
    
    if (filters.requiredLinks.twitter && !metadata?.twitter) return false;
    if (filters.requiredLinks.telegram && !metadata?.telegram) return false;
    if (filters.requiredLinks.website && !metadata?.website) return false;
    
    return true;
  };

  const fetchDexScreenerData = async (caAddress: string): Promise<DexScreenerData | null> => {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${caAddress}`);
      const data = await response.json();
      
      if (data.pairs && data.pairs[0]) {
        return {
          marketCap: parseFloat(data.pairs[0].marketCap) || 0,
          volumeH1: parseFloat(data.pairs[0].volume?.h1 || '0'),
          pairCreatedAt: data.pairs[0].createdAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching DexScreener data:', error);
      return null;
    }
  };

  const fetchMetadata = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  };

  const updateTokensData = async () => {
    setTokens(prevTokens => {
      const updatePromises = prevTokens.map(async token => {
        // Mettre à jour seulement si la dernière mise à jour date de plus de 30 secondes
        if (!token.lastUpdate || Date.now() - token.lastUpdate > 30000) {
          const dexData = await fetchDexScreenerData(token.caAddress);
          if (dexData) {
            return {
              ...token,
              marketCap: dexData.marketCap,
              volume: dexData.volumeH1,
              lastUpdate: Date.now()
            };
          }
        }
        return token;
      });

      // Mettre à jour tous les tokens en une fois
      Promise.all(updatePromises).then(updatedTokens => {
        setTokens(updatedTokens);
      });

      return prevTokens; // Retourner l'état actuel en attendant les mises à jour
    });
  };

  useEffect(() => {
    const interval = setInterval(updateTokensData, 30000); // Mise à jour toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const clearTokens = () => {
    setTokens([]);
  };

  const formatVolume = (volume: number | undefined) => {
    if (!volume) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(volume);
  };

  const truncateAddress = (address: string | undefined) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const renderSocialLink = (url: string | undefined, icon: React.ReactNode) => {
    const isActive = !!url;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`social-link ${!isActive ? 'inactive' : ''}`}
        onClick={(e) => !isActive && e.preventDefault()}
      >
        {icon}
      </a>
    );
  };

  const waitForDexScreenerData = async (caAddress: string, minMarketCap: number): Promise<DexScreenerData | null> => {
    const startTime = Date.now();
    const timeoutMinutes = 10;
    
    console.log(`Starting DexScreener check for ${caAddress}, minimum marketCap: $${minMarketCap}`);
    
    while (Date.now() - startTime < timeoutMinutes * 60 * 1000) {
      try {
        const dexData = await fetchDexScreenerData(caAddress);
        // Pour l'ajout initial, on vérifie le minMarketCap
        if (dexData && dexData.marketCap >= minMarketCap) {
          return dexData;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error while waiting for DexScreener data:', error);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    return null;
  };

  const formatCreationDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="token-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
        <div className="token-table-controls">
          {isMonitoring && (
            <button 
              className="control-button stop-button" 
              onClick={() => {
                stopMonitoring();
              }}
            >
              STOP
            </button>
          )}
        </div>
        <div>
          <button 
            onClick={clearTokens} 
            className="control-button"
            style={{
              backgroundColor: '#00ff00',
              border: '2px solid #00cc00',
              color: 'black',
              padding: '8px 16px',
              fontFamily: 'pixel',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              fontSize: '14px'
            }}
          >
            CLEAR
          </button>
        </div>
      </div>
      <div className="token-table-wrapper">
        <table className="token-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Symbol</th>
              <th>Initial Buy</th>
              <th>Market Cap</th>
              <th>Creation</th>
              <th>Contract Address</th>
              <th>Volume</th>
              <th colSpan={3}>Links</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, index) => (
              <tr key={`${token.caAddress}-${index}`}>
                <td>{token.name}</td>
                <td>{token.symbol}</td>
                <td>{formatVolume(token.initialBuy)}</td>
                <td>{formatVolume(token.marketCap)}</td>
                <td>{token.creationDate}</td>
                <td>
                  <a 
                    href={`https://pump.fun/coin/${token.caAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                  >
                    {truncateAddress(token.caAddress)}
                  </a>
                </td>
                <td>{formatVolume(token.volume)}</td>
                <td>{renderSocialLink(token.twitter, <FaXTwitter />)}</td>
                <td>{renderSocialLink(token.telegram, <FaTelegram />)}</td>
                <td>{renderSocialLink(token.website, <FaGlobe />)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokenTable;
