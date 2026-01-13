import { useEffect, useRef } from 'react';

interface Leaf {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
}

interface FallingLeavesEffectProps {
  enabled: boolean;
}

const LEAF_COLORS = ['#D2691E', '#8B4513', '#CD853F', '#DEB887', '#B8860B', '#DAA520'];

export const FallingLeavesEffect = ({ enabled }: FallingLeavesEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leavesRef = useRef<Leaf[]>([]);
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

    const createLeaf = (): Leaf => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -100,
      size: Math.random() * 15 + 10,
      speedY: Math.random() * 1.5 + 0.5,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 4 - 2,
      opacity: Math.random() * 0.5 + 0.5,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
    });

    leavesRef.current = Array.from({ length: 30 }, createLeaf);

    const drawLeaf = (leaf: Leaf) => {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate((leaf.rotation * Math.PI) / 180);
      ctx.globalAlpha = leaf.opacity;
      ctx.fillStyle = leaf.color;
      
      // Draw a simple leaf shape
      ctx.beginPath();
      ctx.moveTo(0, -leaf.size / 2);
      ctx.bezierCurveTo(
        leaf.size / 2, -leaf.size / 4,
        leaf.size / 2, leaf.size / 4,
        0, leaf.size / 2
      );
      ctx.bezierCurveTo(
        -leaf.size / 2, leaf.size / 4,
        -leaf.size / 2, -leaf.size / 4,
        0, -leaf.size / 2
      );
      ctx.fill();
      
      // Draw stem
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -leaf.size / 2);
      ctx.lineTo(0, leaf.size / 2);
      ctx.stroke();
      
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      leavesRef.current.forEach((leaf) => {
        leaf.y += leaf.speedY;
        leaf.x += leaf.speedX + Math.sin(leaf.y / 30) * 0.5;
        leaf.rotation += leaf.rotationSpeed;

        if (leaf.y > canvas.height + 50) {
          leaf.y = -50;
          leaf.x = Math.random() * canvas.width;
        }

        drawLeaf(leaf);
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
