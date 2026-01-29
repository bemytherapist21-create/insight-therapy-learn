import { useEffect } from 'react';
import { useHandGestures, GestureEvent } from '@/hooks/useHandGestures';
import { Hand, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HandGestureOverlayProps {
    enabled: boolean;
    onToggle: () => void;
}

export const HandGestureOverlay = ({ enabled, onToggle }: HandGestureOverlayProps) => {
    const { isReady, gesture, videoElement } = useHandGestures(enabled);

    // Handle gestures
    useEffect(() => {
        if (!gesture) return;

        const handleGesture = (gestureEvent: GestureEvent) => {
            // Helper to check if element is interactive
            const isInteractive = (element: HTMLElement): boolean => {
                const tagName = element.tagName.toLowerCase();
                const isClickable = ['button', 'a', 'input', 'select', 'textarea'].includes(tagName);
                const hasClickHandler = element.onclick !== null || element.getAttribute('onclick') !== null;
                const hasRole = element.getAttribute('role') === 'button';
                return isClickable || hasClickHandler || hasRole || element.closest('button, a') !== null;
            };

            switch (gestureEvent.type) {
                case 'swipe-left':
                    window.history.back();
                    break;
                case 'swipe-right':
                    window.history.forward();
                    break;
                case 'swipe-up':
                    window.scrollBy({ top: -100, behavior: 'smooth' });
                    break;
                case 'swipe-down':
                    window.scrollBy({ top: 100, behavior: 'smooth' });
                    break;
                case 'pinch':
                    // Click interactive elements (x/y already mirror-corrected from hook)
                    if (gestureEvent.x !== undefined && gestureEvent.y !== undefined) {
                        const x = gestureEvent.x * window.innerWidth;
                        const y = gestureEvent.y * window.innerHeight;
                        const element = document.elementFromPoint(x, y);
                        if (element && element instanceof HTMLElement && isInteractive(element)) {
                            element.click();
                        }
                    }
                    break;
                case 'double-pinch':
                    // Double-click interactive elements (x/y already mirror-corrected)
                    if (gestureEvent.x !== undefined && gestureEvent.y !== undefined) {
                        const x = gestureEvent.x * window.innerWidth;
                        const y = gestureEvent.y * window.innerHeight;
                        const element = document.elementFromPoint(x, y);
                        if (element && element instanceof HTMLElement && isInteractive(element)) {
                            const event = new MouseEvent('dblclick', {
                                bubbles: true,
                                cancelable: true,
                                view: window
                            });
                            element.dispatchEvent(event);
                        }
                    }
                    break;
                case 'point':
                    // Highlight interactive elements (x/y already mirror-corrected)
                    if (gestureEvent.x !== undefined && gestureEvent.y !== undefined) {
                        const x = gestureEvent.x * window.innerWidth;
                        const y = gestureEvent.y * window.innerHeight;
                        const element = document.elementFromPoint(x, y);
                        if (element && element instanceof HTMLElement && isInteractive(element)) {
                            // Visual feedback for pointing at clickable elements
                            element.style.outline = '2px solid #8b5cf6';
                            element.style.outlineOffset = '2px';
                            setTimeout(() => {
                                element.style.outline = '';
                                element.style.outlineOffset = '';
                            }, 200);
                        }
                    }
                    break;
            }
        };

        handleGesture(gesture);
    }, [gesture]);

    if (!enabled) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Status indicator */}
            <div className="flex items-center gap-3 bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2">
                <div className="flex items-center gap-2">
                    <Hand className={`w-5 h-5 ${isReady ? 'text-green-400 animate-pulse' : 'text-yellow-400'}`} />
                    <span className="text-sm text-white">
                        {isReady ? 'Hand Gestures Active' : 'Initializing...'}
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

            {/* Gesture feedback */}
            {gesture && (
                <div className="mt-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 rounded-lg px-3 py-1 text-xs text-white animate-fade-in">
                    {gesture.type.replace('-', ' ').toUpperCase()}
                </div>
            )}

            {/* Camera preview (optional) */}
            {videoElement && (
                <div className="mt-2 overflow-hidden rounded-lg border-2 border-purple-500/30 hidden">
                    <video
                        ref={(el) => {
                            if (el && videoElement) {
                                el.srcObject = (videoElement as any).srcObject;
                            }
                        }}
                        className="w-40 h-30 object-cover transform -scale-x-100"
                        autoPlay
                        muted
                        playsInline
                    />
                </div>
            )}
        </div>
    );
};
