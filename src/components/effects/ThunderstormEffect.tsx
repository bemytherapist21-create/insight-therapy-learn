import { useEffect, useRef, useState } from "react";

interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

interface ThunderstormEffectProps {
  enabled: boolean;
}

export const ThunderstormEffect = ({ enabled }: ThunderstormEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raindropsRef = useRef<Raindrop[]>([]);
  const animationRef = useRef<number>();
  const [lightning, setLightning] = useState(false);

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

    const createRaindrop = (): Raindrop => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      length: Math.random() * 20 + 15,
      speed: Math.random() * 10 + 15,
      opacity: Math.random() * 0.3 + 0.4,
    });

    raindropsRef.current = Array.from({ length: 200 }, createRaindrop);

    // Lightning effect
    const triggerLightning = () => {
      if (!enabled) return;

      const randomDelay = Math.random() * 5000 + 3000;
      setTimeout(() => {
        if (!enabled) return;
        setLightning(true);
        setTimeout(() => setLightning(false), 100);
        // Sometimes double flash
        if (Math.random() > 0.5) {
          setTimeout(() => {
            setLightning(true);
            setTimeout(() => setLightning(false), 50);
          }, 150);
        }
        triggerLightning();
      }, randomDelay);
    };

    triggerLightning();

    const animate = () => {
      // Dark overlay for storm
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      raindropsRef.current.forEach((drop) => {
        ctx.strokeStyle = `rgba(174, 194, 224, ${drop.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 2, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x += 2;

        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
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
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ background: "transparent" }}
      />
      {/* Lightning flash overlay */}
      <div
        className={`fixed inset-0 pointer-events-none z-50 transition-opacity duration-75 ${
          lightning ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, rgba(255, 255, 255, 0.8), transparent 70%)",
        }}
      />
    </>
  );
};
