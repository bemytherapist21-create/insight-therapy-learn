import { useEffect, useState, useRef } from 'react';
import { useHandGestures, GestureEvent } from '@/hooks/useHandGestures';
import { Hand, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HandGestureOverlayProps {
    enabled: boolean;
    onToggle: () => void;
}

export const HandGestureOverlay = ({ enabled, onToggle }: HandGestureOverlayProps) => {
    const { isReady, gesture, videoElement } = useHandGestures(enabled);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [isClicking, setIsClicking] = useState(false);
    const lastClickTimeRef = useRef<number>(0);

    // Handle gestures - just cursor movement and click
    useEffect(() => {
        if (!gesture) return;

        const handleGesture = (gestureEvent: GestureEvent) => {
            switch (gestureEvent.type) {
                case 'point':
                    // Move cursor to index finger position (flip X for mirror effect)
                    if (gestureEvent.x !== undefined && gestureEvent.y !== undefined) {
                        const x = (1 - gestureEvent.x) * window.innerWidth; // Flip horizontally
                        const y = gestureEvent.y * window.innerHeight;
                        setCursorPosition({ x, y });
                    }
                    break;

                case 'pinch':
                    // Click at current cursor position
                    const now = Date.now();
                    if (now - lastClickTimeRef.current > 300) { // Debounce clicks
                        const element = document.elementFromPoint(cursorPosition.x, cursorPosition.y);
                        if (element && element instanceof HTMLElement) {
                            setIsClicking(true);
                            element.click();
                            setTimeout(() => setIsClicking(false), 150);
                            lastClickTimeRef.current = now;
                        }
                    }
                    break;
            }
        };

        handleGesture(gesture);
    }, [gesture, cursorPosition]);

    if (!enabled) return null;

    return (
        <>
            {/* Virtual Cursor */}
            {isReady && (
                <div
                    className="fixed pointer-events-none z-[60] transition-transform"
                    style={{
                        left: `${cursorPosition.x}px`,
                        top: `${cursorPosition.y}px`,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    {/* Cursor dot */}
                    <div className={`w-6 h-6 rounded-full border-2 ${isClicking ? 'bg-purple-500 border-purple-300 scale-75' : 'bg-purple-500/50 border-purple-400'} transition-all shadow-lg`}>
                        <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                    </div>
                    {/* Cursor trail */}
                    <div className="absolute -inset-2 rounded-full bg-purple-500/20 blur-md" />
                </div>
            )}

            {/* Status indicator */}
            <div className="fixed bottom-4 right-4 z-50">
                <div className="flex items-center gap-3 bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2">
                    <div className="flex items-center gap-2">
                        <Hand className={`w-5 h-5 ${isReady ? 'text-green-400 animate-pulse' : 'text-yellow-400'}`} />
                        <span className="text-sm text-white">
                            {isReady ? 'Hand Mouse Active' : 'Initializing...'}
                        </span>
                    </div>

                    <Button
                        onClick={onToggle}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-white/10"
                    >
                        <X className="w-4 h-4 text-white" />
                    </Button>
                </div>

                {/* Instructions */}
                {isReady && (
                    <div className="mt-2 bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-white/80">
                        <div>👆 Point to move cursor</div>
                        <div>🤏 Pinch to click</div>
                    </div>
                )}
            </div>
        </>
    );
};
