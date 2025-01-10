import React, { useState } from 'react';

interface StepDescription {
  title: string;
  description: string;
}

interface PhaseDescription {
  title: string;
  description: string;
}

const stepDescriptions: StepDescription[] = [
  {
    title: "TOKEN AGE SCAN",
    description: "Our advanced scanning system continuously monitors the Solana blockchain for newly created tokens, analyzing their age and initial parameters to identify potential opportunities early."
  },
  {
    title: "MARKET CAP RANGE",
    description: "Sophisticated filtering system that tracks market capitalization in real-time, allowing you to focus on tokens within your preferred investment range and growth potential."
  },
  {
    title: "SUPPLY ANALYSIS",
    description: "Deep dive into token supply metrics, including circulation, distribution patterns, and holder analysis to identify healthy token economics and avoid potential dumps."
  },
  {
    title: "TAG DETECTION",
    description: "Smart tagging system that categorizes tokens based on their characteristics, team activity, and community engagement to help you make informed investment decisions."
  }
];

const phaseDescriptions: PhaseDescription[] = [
  {
    title: "MONITOR ACTIVATION",
    description: "Deep scan of the Solana blockchain to identify newly created tokens. Analyzes token creation patterns and initial liquidity events."
  },
  {
    title: "ANALYTICS MODULE",
    description: "Real-time tracking of market movements, volume analysis, and price action patterns. Identifies potential pump signals and market manipulation attempts."
  },
  {
    title: "CHAIN EXPANSION",
    description: "Advanced security checks for contract vulnerabilities, ownership analysis, and liquidity lock verification. Helps protect against rugs and scams."
  },
  {
    title: "GAMEFI PROTOCOL",
    description: "Machine learning algorithms analyze historical data and current market conditions to predict potential pump events with high accuracy."
  }
];

const InfoCards = () => {
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

  const handlePreviousPhase = () => {
    if (selectedPhaseIndex !== null) {
      setSelectedPhaseIndex((prev: number | null) => {
        if (prev === null) return 0;
        return prev === 0 ? phaseDescriptions.length - 1 : prev - 1;
      });
    }
  };

  const handleNextPhase = () => {
    if (selectedPhaseIndex !== null) {
      setSelectedPhaseIndex((prev: number | null) => {
        if (prev === null) return 0;
        return prev === phaseDescriptions.length - 1 ? 0 : prev + 1;
      });
    }
  };

  const handlePreviousStep = () => {
    if (selectedStepIndex !== null) {
      setSelectedStepIndex((prev: number | null) => {
        if (prev === null) return 0;
        return prev === 0 ? stepDescriptions.length - 1 : prev - 1;
      });
    }
  };

  const handleNextStep = () => {
    if (selectedStepIndex !== null) {
      setSelectedStepIndex((prev: number | null) => {
        if (prev === null) return 0;
        return prev === stepDescriptions.length - 1 ? 0 : prev + 1;
      });
    }
  };

  return (
    <>
      {/* How It Works Card */}
      <div className="info-card info-card-left">
        <div className="card-content">
          <div className="card-header">
            <div className="corner-accent top-left" />
            <div className="corner-accent top-right" />
            <div className="corner-accent bottom-left" />
            <div className="corner-accent bottom-right" />
            <h2 className="card-title">SYSTEM CONFIG</h2>
          </div>
          <div className="steps">
            {stepDescriptions.map((step, index) => (
              <div 
                key={index} 
                className="step"
                onClick={() => setSelectedStepIndex(index)}
                style={{ cursor: 'pointer' }}
              >
                <div className="step-icon">{index + 1}</div>
                <div className="step-text">{step.title}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="scanlines"></div>
        <div className="card-glow"></div>
      </div>

      {/* Roadmap Card */}
      <div className="info-card info-card-right">
        <div className="card-content">
          <div className="card-header">
            <div className="corner-accent top-left" />
            <div className="corner-accent top-right" />
            <div className="corner-accent bottom-left" />
            <div className="corner-accent bottom-right" />
            <h2 className="card-title">SYSTEM UPGRADES</h2>
          </div>
          <div className="roadmap">
            {phaseDescriptions.map((phase, index) => (
              <div 
                key={index} 
                className="phase" 
                onClick={() => setSelectedPhaseIndex(index)}
                style={{ cursor: 'pointer' }}
              >
                <div className="phase-icon">{index + 1}</div>
                <div className="phase-text">{phase.title}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="scanlines"></div>
        <div className="card-glow"></div>
      </div>

      {/* Step Description Modal */}
      {selectedStepIndex !== null && (
        <div className="modal-overlay" onClick={() => setSelectedStepIndex(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{stepDescriptions[selectedStepIndex].title}</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedStepIndex(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>{stepDescriptions[selectedStepIndex].description}</p>
            </div>
            <div className="modal-footer">
              {selectedStepIndex > 0 && (
                <button 
                  className="modal-nav-button"
                  onClick={handlePreviousStep}
                >
                  ← PREVIOUS
                </button>
              )}
              {selectedStepIndex === 0 && <div className="modal-nav-spacer"></div>}
              
              <div className="modal-page-indicator">
                {stepDescriptions[selectedStepIndex].title} ({selectedStepIndex + 1}/{stepDescriptions.length})
              </div>
              
              {selectedStepIndex < stepDescriptions.length - 1 && (
                <button 
                  className="modal-nav-button"
                  onClick={handleNextStep}
                >
                  NEXT →
                </button>
              )}
              {selectedStepIndex === stepDescriptions.length - 1 && <div className="modal-nav-spacer"></div>}
            </div>
          </div>
        </div>
      )}

      {/* Phase Description Modal */}
      {selectedPhaseIndex !== null && (
        <div className="modal-overlay" onClick={() => setSelectedPhaseIndex(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{phaseDescriptions[selectedPhaseIndex].title}</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedPhaseIndex(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>{phaseDescriptions[selectedPhaseIndex].description}</p>
            </div>
            <div className="modal-footer">
              {selectedPhaseIndex > 0 && (
                <button 
                  className="modal-nav-button"
                  onClick={handlePreviousPhase}
                >
                  ← PREVIOUS
                </button>
              )}
              {selectedPhaseIndex === 0 && <div className="modal-nav-spacer"></div>}
              
              <div className="modal-page-indicator">
                {phaseDescriptions[selectedPhaseIndex].title} ({selectedPhaseIndex + 1}/{phaseDescriptions.length})
              </div>
              
              {selectedPhaseIndex < phaseDescriptions.length - 1 && (
                <button 
                  className="modal-nav-button"
                  onClick={handleNextPhase}
                >
                  NEXT →
                </button>
              )}
              {selectedPhaseIndex === phaseDescriptions.length - 1 && <div className="modal-nav-spacer"></div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoCards;
