import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface TieFighter {
  x: number;
  y: number;
  speed: number;
  scale: number;
  opacity: number;
  direction: 1 | -1;
}

const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const tieRef = useRef<TieFighter | null>(null);
  const animRef = useRef<number>(0);
  const lastTieTime = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 3000);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    };

    const drawTieFighter = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, opacity: number, direction: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale * direction, scale);
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = '#556677';
      ctx.fillStyle = '#334455';
      ctx.lineWidth = 1.5 / scale;

      // Center cockpit (ball)
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cockpit window
      ctx.fillStyle = '#88aacc';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Struts
      ctx.strokeStyle = '#556677';
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(-16, -14);
      ctx.moveTo(-6, 2);
      ctx.lineTo(-16, 14);
      ctx.moveTo(6, -2);
      ctx.lineTo(16, -14);
      ctx.moveTo(6, 2);
      ctx.lineTo(16, 14);
      ctx.stroke();

      // Wings (hexagonal panels)
      ctx.fillStyle = '#334455';
      ctx.beginPath();
      ctx.moveTo(-16, -16);
      ctx.lineTo(-14, -16);
      ctx.lineTo(-14, 16);
      ctx.lineTo(-16, 16);
      ctx.lineTo(-20, 8);
      ctx.lineTo(-20, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(16, -16);
      ctx.lineTo(14, -16);
      ctx.lineTo(14, 16);
      ctx.lineTo(16, 16);
      ctx.lineTo(20, 8);
      ctx.lineTo(20, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    const spawnTie = (now: number) => {
      const direction = Math.random() > 0.5 ? 1 : -1 as 1 | -1;
      const scale = Math.random() * 0.8 + 0.4;
      tieRef.current = {
        x: direction === 1 ? -40 : canvas.width + 40,
        y: Math.random() * canvas.height * 0.6 + canvas.height * 0.1,
        speed: (Math.random() * 2 + 1.5) * direction,
        scale,
        opacity: Math.random() * 0.3 + 0.15,
        direction: direction as 1 | -1,
      };
      lastTieTime.current = now;
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = time / 1000;

      // Draw stars
      for (const star of starsRef.current) {
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.opacity * (0.5 + 0.5 * twinkle);
        const glint = twinkle > 0.9;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = glint ? '#aaccff' : '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * (glint ? 1.5 : 1), 0, Math.PI * 2);
        ctx.fill();

        // Cross glint effect for brighter stars
        if (glint && star.size > 1.2) {
          ctx.globalAlpha = alpha * 0.4;
          ctx.strokeStyle = '#aaccff';
          ctx.lineWidth = 0.5;
          const len = star.size * 4;
          ctx.beginPath();
          ctx.moveTo(star.x - len, star.y);
          ctx.lineTo(star.x + len, star.y);
          ctx.moveTo(star.x, star.y - len);
          ctx.lineTo(star.x, star.y + len);
          ctx.stroke();
        }
      }

      // TIE fighter logic
      if (!tieRef.current) {
        // Spawn one every 15-30 seconds
        if (time - lastTieTime.current > (Math.random() * 15000 + 15000)) {
          spawnTie(time);
        }
      } else {
        const tie = tieRef.current;
        tie.x += tie.speed;
        drawTieFighter(ctx, tie.x, tie.y, tie.scale, tie.opacity, tie.direction);

        // Remove when off screen
        if ((tie.direction === 1 && tie.x > canvas.width + 60) ||
            (tie.direction === -1 && tie.x < -60)) {
          tieRef.current = null;
          lastTieTime.current = time;
        }
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default StarfieldBackground;
