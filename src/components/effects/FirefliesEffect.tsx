import { useEffect, useRef } from "react";

interface Firefly {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  glowPhase: number;
  glowSpeed: number;
  maxGlow: number;
}

interface FirefliesEffectProps {
  enabled: boolean;
}

export const FirefliesEffect = ({ enabled }: FirefliesEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firefliesRef = useRef<Firefly[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createFirefly = (): Firefly => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 2,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 1 - 0.5,
      glowPhase: Math.random() * Math.PI * 2,
      glowSpeed: Math.random() * 0.05 + 0.02,
      maxGlow: Math.random() * 0.5 + 0.5,
    });

    firefliesRef.current = Array.from({ length: 25 }, createFirefly);

    const drawFirefly = (firefly: Firefly) => {
      const glow = ((Math.sin(firefly.glowPhase) + 1) / 2) * firefly.maxGlow;

      if (glow < 0.1) return; // Don't draw when very dim

      ctx.save();

      // Outer glow
      const gradient = ctx.createRadialGradient(
        firefly.x,
        firefly.y,
        0,
        firefly.x,
        firefly.y,
        firefly.size * 8,
      );
      gradient.addColorStop(0, `rgba(255, 255, 100, ${glow})`);
      gradient.addColorStop(0.3, `rgba(255, 230, 50, ${glow * 0.5})`);
      gradient.addColorStop(1, "rgba(255, 255, 100, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(firefly.x, firefly.y, firefly.size * 8, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright core
      ctx.fillStyle = `rgba(255, 255, 200, ${glow})`;
      ctx.beginPath();
      ctx.arc(firefly.x, firefly.y, firefly.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      firefliesRef.current.forEach((firefly) => {
        firefly.glowPhase += firefly.glowSpeed;

        // Random direction changes
        if (Math.random() < 0.02) {
          firefly.speedX = Math.random() * 1 - 0.5;
          firefly.speedY = Math.random() * 1 - 0.5;
        }

        firefly.x += firefly.speedX;
        firefly.y += firefly.speedY;

        // Wrap around screen
        if (firefly.x < 0) firefly.x = canvas.width;
        if (firefly.x > canvas.width) firefly.x = 0;
        if (firefly.y < 0) firefly.y = canvas.height;
        if (firefly.y > canvas.height) firefly.y = 0;

        drawFirefly(firefly);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
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
      style={{ background: "transparent" }}
    />
  );
};
