import React, { useEffect, useRef } from 'react';

const RetroBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    // Blockchain nodes
    const nodes: { x: number; y: number; size: number; pulse: number }[] = [];
    for (let i = 0; i < 20; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 4 + Math.random() * 4,
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Grid properties
    const gridSize = 30;
    let gridOffset = 0;

    // Animation loop
    const animate = () => {
      // Clear canvas with semi-transparent black
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw moving grid
      ctx.strokeStyle = 'rgba(155, 188, 15, 0.1)';
      ctx.lineWidth = 1;
      gridOffset = (gridOffset + 0.2) % gridSize;
      
      // Vertical lines
      for (let x = gridOffset; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = gridOffset; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Drawing the characters
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0';
      ctx.font = `${fontSize}px monospace`;
      ctx.globalAlpha = 0.3;

      // Loop over drops
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      // Draw and update nodes
      nodes.forEach(node => {
        node.pulse += 0.05;
        const glowSize = Math.sin(node.pulse) * 2 + 2;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + glowSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(155, 188, 15, ${0.1 + Math.sin(node.pulse) * 0.1})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(155, 188, 15, 0.8)';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="retro-background"
    />
  );
};

export default RetroBackground;
