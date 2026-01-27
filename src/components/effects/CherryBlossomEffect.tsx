import { useEffect, useRef } from "react";

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

interface CherryBlossomEffectProps {
  enabled: boolean;
}

export const CherryBlossomEffect = ({ enabled }: CherryBlossomEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
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

    const createPetal = (): Petal => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -100,
      size: Math.random() * 8 + 6,
      speedY: Math.random() * 1 + 0.5,
      speedX: Math.random() * 0.5 - 0.25,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 2 - 1,
      opacity: Math.random() * 0.4 + 0.6,
      wobble: 0,
      wobbleSpeed: Math.random() * 0.05 + 0.02,
    });

    petalsRef.current = Array.from({ length: 40 }, createPetal);

    const drawPetal = (petal: Petal) => {
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate((petal.rotation * Math.PI) / 180);
      ctx.globalAlpha = petal.opacity;

      // Create gradient for petal
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, petal.size);
      gradient.addColorStop(0, "#FFB7C5");
      gradient.addColorStop(0.5, "#FFC0CB");
      gradient.addColorStop(1, "#FFD1DC");
      ctx.fillStyle = gradient;

      // Draw petal shape
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.size / 2, petal.size, 0, 0, Math.PI * 2);
      ctx.fill();

      // Add subtle center detail
      ctx.fillStyle = "#FF69B4";
      ctx.globalAlpha = petal.opacity * 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, petal.size / 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petalsRef.current.forEach((petal) => {
        petal.wobble += petal.wobbleSpeed;
        petal.y += petal.speedY;
        petal.x += petal.speedX + Math.sin(petal.wobble) * 1.5;
        petal.rotation += petal.rotationSpeed;

        if (petal.y > canvas.height + 50) {
          petal.y = -50;
          petal.x = Math.random() * canvas.width;
        }

        drawPetal(petal);
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
