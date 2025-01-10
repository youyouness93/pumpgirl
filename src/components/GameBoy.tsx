interface GameBoyProps {
  children: React.ReactNode
}

export default function GameBoy({ children }: GameBoyProps) {
  return (
    <div className="cyber-container">
      <div className="gameboy">
        {/* Power Light */}
        <div className="power-light"></div>

        {/* Screen Border */}
        <div className="screen-border">
          <div className="screen">
            {children}
          </div>
        </div>

        {/* Controls Area */}
        <div className="flex justify-between items-center">
          {/* D-Pad */}
          <div className="d-pad"></div>

          {/* Right Side */}
          <div className="flex flex-col items-end gap-8">
            {/* AB Buttons */}
            <div className="buttons">
              <div className="button"></div>
              <div className="button"></div>
            </div>

            {/* Start/Select */}
            <div className="controls">
              
              
            </div>
          </div>
        </div>

        {/* Speaker Lines */}
        <div className="speaker-lines">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="speaker-line"
              style={{ '--line-index': i } as any}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
