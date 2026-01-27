import { useEffect, useRef } from "react";

interface Confetti {
  x: number;
  y: number;
  width: number;
  height: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  wobble: number;
  wobbleSpeed: number;
}

interface ConfettiEffectProps {
  enabled: boolean;
}

const CONFETTI_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8B500",
  "#FF69B4",
];

export const ConfettiEffect = ({ enabled }: ConfettiEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<Confetti[]>([]);
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

    const createConfetti = (): Confetti => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      width: Math.random() * 8 + 4,
      height: Math.random() * 4 + 2,
      speedY: Math.random() * 2 + 1,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5,
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.1 + 0.05,
    });

    confettiRef.current = Array.from({ length: 50 }, createConfetti);

    const drawConfetti = (piece: Confetti) => {
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate((piece.rotation * Math.PI) / 180);

      ctx.fillStyle = piece.color;
      ctx.fillRect(
        -piece.width / 2,
        -piece.height / 2,
        piece.width,
        piece.height,
      );

      // Add shine effect
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(
        -piece.width / 2,
        -piece.height / 2,
        piece.width / 3,
        piece.height,
      );

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiRef.current.forEach((piece) => {
        piece.wobble += piece.wobbleSpeed;
        piece.y += piece.speedY;
        piece.x += piece.speedX + Math.sin(piece.wobble) * 0.5;
        piece.rotation += piece.rotationSpeed;

        if (piece.y > canvas.height + 50) {
          piece.y = -20;
          piece.x = Math.random() * canvas.width;
        }

        drawConfetti(piece);
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
