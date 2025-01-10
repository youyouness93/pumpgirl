import React from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface BannerProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

const Banner: React.FC<BannerProps> = ({ isMuted, onToggleMute }) => {
  return (
    <div className="banner">
      <div className="banner-inner">
        <div className="flex flex-row items-center justify-between max-w-7xl mx-auto gap-4 px-2">
          <h1 className="banner-title shrink-0">
            PUMPBOY
          </h1>
          
          <div className="banner-content flex-1">
            <p className="banner-text primary">
              Explore new tokens on Pump.fun with a retro-futuristic tool
            </p>
            <p className="banner-text secondary">
              Analyze, track, and stay up-to-date in style!
            </p>
          </div>

          <button 
            onClick={onToggleMute}
            className="mute-button"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <FaVolumeMute size={24} /> : <FaVolumeUp size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
