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
                    // Navigate left (back)
                    window.history.back();
                    break;
                case 'swipe-right':
                    // Navigate right (forward)
                    window.history.forward();
                    break;
                case 'swipe-up':
                    // Navigate up (scroll up)
                    window.scrollBy({ top: -100, behavior: 'smooth' });
                    break;
                case 'swipe-down':
                    // Navigate down (scroll down)
                    window.scrollBy({ top: 100, behavior: 'smooth' });
                    break;
                case 'pinch':
                    // Only click interactive elements (with mirror fix)
                    if (gestureEvent.x !== undefined && gestureEvent.y !== undefined) {
                        const x = (1 - gestureEvent.x) * window.innerWidth; // Flip horizontally
                        const y = gestureEvent.y * window.innerHeight;
                        const element = document.elementFromPoint(x, y);
                        if (element && element instanceof HTMLElement && isInteractive(element)) {
                            element.click();
                        }
                    }
                    break;
                case 'double-pinch':
                    // Only double-click interactive elements (with mirror fix)
                    if (gestureEvent.x !== undefined && gestureEvent.y !== undefined) {
                        const x = (1 - gestureEvent.x) * window.innerWidth; // Flip horizontally
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
                    // Only highlight interactive elements (with mirror fix)
                    if (gestureEvent.x !== undefined && gestureEvent.y !== undefined) {
                        const x = (1 - gestureEvent.x) * window.innerWidth; // Flip horizontally
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
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {/* Experimental Warning */}
            <div className="bg-orange-500/90 backdrop-blur-sm border border-orange-400 rounded-lg px-3 py-2 text-xs text-white">
                <div className="font-bold flex items-center gap-1">
                    ⚠️ EXPERIMENTAL FEATURE
                </div>
                <div className="text-orange-100">May impact performance</div>
            </div>

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
                <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 rounded-lg px-3 py-1 text-xs text-white animate-fade-in">
                    {gesture.type.replace('-', ' ').toUpperCase()}
                </div>
            )}
        </div>
    );
};
