import { useEffect, useState } from 'react';
import { useHandGestures, GestureEvent } from '@/hooks/useHandGestures';
import { Hand, X, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HandGestureOverlayProps {
    enabled: boolean;
    onToggle: () => void;
}

export const HandGestureOverlay = ({ enabled, onToggle }: HandGestureOverlayProps) => {
    const { isReady, gesture, handPosition, videoElement } = useHandGestures(enabled);
    const [isPinching, setIsPinching] = useState(false);

    // Track pinch state for cursor styling
    useEffect(() => {
        if (gesture?.type === 'pinch' || gesture?.type === 'double-pinch') {
            setIsPinching(true);
            const timer = setTimeout(() => setIsPinching(false), 200);
            return () => clearTimeout(timer);
        }
    }, [gesture]);

    // Handle gestures
    useEffect(() => {
        if (!gesture) return;

        const handleGesture = (gestureEvent: GestureEvent) => {
            // Helper to find the best clickable element
            const findClickableElement = (element: HTMLElement): HTMLElement | null => {
                const tagName = element.tagName.toLowerCase();
                const isClickable = ['button', 'a', 'input', 'select', 'textarea', 'label'].includes(tagName);
                const hasClickHandler = element.onclick !== null || element.getAttribute('onclick') !== null;
                const hasRole = ['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio'].includes(element.getAttribute('role') || '');
                const hasCursorPointer = window.getComputedStyle(element).cursor === 'pointer';
                const hasDataAction = element.hasAttribute('data-action') || element.hasAttribute('data-testid');
                
                if (isClickable || hasClickHandler || hasRole || hasCursorPointer || hasDataAction) {
                    return element;
                }
                
                // Check parent elements up to 5 levels
                const clickableParent = element.closest('button, a, [role="button"], [onclick], label') as HTMLElement | null;
                return clickableParent;
            };

            // Show click ripple effect at position
            const showClickRipple = (x: number, y: number) => {
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y}px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(34, 197, 94, 0.5);
                    transform: translate(-50%, -50%) scale(0);
                    pointer-events: none;
                    z-index: 10000;
                    animation: gesture-ripple 0.4s ease-out forwards;
                `;
                document.body.appendChild(ripple);
                setTimeout(() => ripple.remove(), 400);
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
                    if (gestureEvent.x !== undefined && gestureEvent.y !== undefined) {
                        // x is already flipped in the hook, just scale to screen
                        const x = gestureEvent.x * window.innerWidth;
                        const y = gestureEvent.y * window.innerHeight;
                        
                        // Show ripple effect
                        showClickRipple(x, y);
                        
                        const element = document.elementFromPoint(x, y);
                        if (element && element instanceof HTMLElement) {
                            const clickable = findClickableElement(element);
                            if (clickable) {
                                // Dispatch proper mouse events for better compatibility
                                const mouseEvent = new MouseEvent('click', {
                                    bubbles: true,
                                    cancelable: true,
                                    view: window,
                                    clientX: x,
                                    clientY: y
                                });
                                clickable.dispatchEvent(mouseEvent);
                            }
                        }
                    }
                    break;
                case 'double-pinch':
                    if (gestureEvent.x !== undefined && gestureEvent.y !== undefined) {
                        // x is already flipped in the hook, just scale to screen
                        const x = gestureEvent.x * window.innerWidth;
                        const y = gestureEvent.y * window.innerHeight;
                        showClickRipple(x, y);
                        
                        const element = document.elementFromPoint(x, y);
                        if (element && element instanceof HTMLElement) {
                            const clickable = findClickableElement(element);
                            if (clickable) {
                                const event = new MouseEvent('dblclick', {
                                    bubbles: true,
                                    cancelable: true,
                                    view: window,
                                    clientX: x,
                                    clientY: y
                                });
                                clickable.dispatchEvent(event);
                            }
                        }
                    }
                    break;
                case 'point':
                    if (gestureEvent.x !== undefined && gestureEvent.y !== undefined) {
                        // x is already flipped in the hook, just scale to screen
                        const x = gestureEvent.x * window.innerWidth;
                        const y = gestureEvent.y * window.innerHeight;
                        const element = document.elementFromPoint(x, y);
                        if (element && element instanceof HTMLElement) {
                            const clickable = findClickableElement(element);
                            if (clickable) {
                                clickable.style.outline = '2px solid #8b5cf6';
                                clickable.style.outlineOffset = '2px';
                                setTimeout(() => {
                                    clickable.style.outline = '';
                                    clickable.style.outlineOffset = '';
                                }, 200);
                            }
                        }
                    }
                    break;
            }
        };

        handleGesture(gesture);
    }, [gesture]);

    if (!enabled) return null;

    return (
        <>
            {/* Hand Cursor Overlay */}
            {handPosition && isReady && (
                <div
                    className="fixed pointer-events-none z-[9999] transition-all duration-75 ease-out"
                    style={{
                        left: handPosition.x,
                        top: handPosition.y,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    {/* Outer ring */}
                    <div 
                        className={`absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-150 ${
                            isPinching 
                                ? 'border-green-400 bg-green-400/30 scale-75' 
                                : 'border-purple-400 bg-purple-400/20'
                        }`}
                    />
                    
                    {/* Inner dot */}
                    <div 
                        className={`absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-150 ${
                            isPinching 
                                ? 'bg-green-400 scale-150' 
                                : 'bg-purple-500'
                        }`}
                    />
                    
                    {/* Pointer icon */}
                    <MousePointer2 
                        className={`absolute w-5 h-5 translate-x-1 translate-y-1 transition-all duration-150 ${
                            isPinching ? 'text-green-300 scale-90' : 'text-white drop-shadow-lg'
                        }`}
                    />
                </div>
            )}

            {/* Control Panel */}
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
                            {isReady ? 'Hand Tracking Active' : 'Initializing...'}
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
        </>
    );
};
