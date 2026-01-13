import { useEffect, useRef } from 'react';

interface Bat {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  wingPhase: number;
  wingSpeed: number;
}

interface BatsEffectProps {
  enabled: boolean;
}

export const BatsEffect = ({ enabled }: BatsEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const batsRef = useRef<Bat[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createBat = (): Bat => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.6,
      size: Math.random() * 15 + 10,
      speedX: Math.random() * 3 + 1,
      speedY: Math.random() * 2 - 1,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: Math.random() * 0.3 + 0.2,
    });

    batsRef.current = Array.from({ length: 15 }, createBat);

    const drawBat = (bat: Bat) => {
      ctx.save();
      ctx.translate(bat.x, bat.y);
      
      const wingFlap = Math.sin(bat.wingPhase) * 0.5;
      
      ctx.fillStyle = '#1a1a2e';
      
      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, bat.size * 0.3, bat.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Head
      ctx.beginPath();
      ctx.arc(0, -bat.size * 0.35, bat.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Ears
      ctx.beginPath();
      ctx.moveTo(-bat.size * 0.15, -bat.size * 0.5);
      ctx.lineTo(-bat.size * 0.1, -bat.size * 0.7);
      ctx.lineTo(-bat.size * 0.05, -bat.size * 0.5);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(bat.size * 0.15, -bat.size * 0.5);
      ctx.lineTo(bat.size * 0.1, -bat.size * 0.7);
      ctx.lineTo(bat.size * 0.05, -bat.size * 0.5);
      ctx.fill();
      
      // Left wing
      ctx.beginPath();
      ctx.moveTo(-bat.size * 0.2, 0);
      ctx.quadraticCurveTo(
        -bat.size * 0.8, -bat.size * (0.3 + wingFlap),
        -bat.size, bat.size * (0.2 - wingFlap * 0.5)
      );
      ctx.quadraticCurveTo(
        -bat.size * 0.6, bat.size * 0.3,
        -bat.size * 0.2, bat.size * 0.2
      );
      ctx.fill();
      
      // Right wing
      ctx.beginPath();
      ctx.moveTo(bat.size * 0.2, 0);
      ctx.quadraticCurveTo(
        bat.size * 0.8, -bat.size * (0.3 + wingFlap),
        bat.size, bat.size * (0.2 - wingFlap * 0.5)
      );
      ctx.quadraticCurveTo(
        bat.size * 0.6, bat.size * 0.3,
        bat.size * 0.2, bat.size * 0.2
      );
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(-bat.size * 0.08, -bat.size * 0.35, bat.size * 0.05, 0, Math.PI * 2);
      ctx.arc(bat.size * 0.08, -bat.size * 0.35, bat.size * 0.05, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      batsRef.current.forEach((bat) => {
        bat.wingPhase += bat.wingSpeed;
        bat.x += bat.speedX;
        bat.y += bat.speedY + Math.sin(bat.wingPhase * 0.5) * 0.5;

        if (bat.x > canvas.width + 50) {
          bat.x = -50;
          bat.y = Math.random() * canvas.height * 0.6;
        }
        if (bat.y < -50) bat.y = canvas.height * 0.6;
        if (bat.y > canvas.height * 0.7) bat.y = 0;

        drawBat(bat);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
};
