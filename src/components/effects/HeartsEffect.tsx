import { useEffect, useRef } from 'react';

interface Heart {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  wobble: number;
  wobbleSpeed: number;
}

interface HeartsEffectProps {
  enabled: boolean;
}

const HEART_COLORS = ['#FF1744', '#E91E63', '#FF4081', '#F50057', '#C51162', '#FF6B9D'];

export const HeartsEffect = ({ enabled }: HeartsEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartsRef = useRef<Heart[]>([]);
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

    const createHeart = (): Heart => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      size: Math.random() * 15 + 8,
      speedY: Math.random() * 1.5 + 0.5,
      speedX: Math.random() * 0.5 - 0.25,
      rotation: Math.random() * 30 - 15,
      rotationSpeed: Math.random() * 2 - 1,
      opacity: Math.random() * 0.4 + 0.6,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.05 + 0.02,
    });

    heartsRef.current = Array.from({ length: 30 }, createHeart);

    const drawHeart = (heart: Heart) => {
      ctx.save();
      ctx.translate(heart.x, heart.y);
      ctx.rotate((heart.rotation * Math.PI) / 180);
      ctx.globalAlpha = heart.opacity;
      ctx.fillStyle = heart.color;
      
      const size = heart.size;
      
      ctx.beginPath();
      ctx.moveTo(0, size * 0.3);
      ctx.bezierCurveTo(
        -size, -size * 0.3,
        -size, -size,
        0, -size * 0.5
      );
      ctx.bezierCurveTo(
        size, -size,
        size, -size * 0.3,
        0, size * 0.3
      );
      ctx.fill();
      
      // Add shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-size * 0.3, -size * 0.4, size * 0.15, size * 0.2, -0.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      heartsRef.current.forEach((heart) => {
        heart.wobble += heart.wobbleSpeed;
        heart.y -= heart.speedY;
        heart.x += heart.speedX + Math.sin(heart.wobble) * 0.5;
        heart.rotation += heart.rotationSpeed;

        if (heart.y < -50) {
          heart.y = canvas.height + 50;
          heart.x = Math.random() * canvas.width;
        }

        drawHeart(heart);
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
