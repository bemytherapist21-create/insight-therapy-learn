import { useEffect, useRef, useState, useCallback } from 'react';

export interface GestureEvent {
    type: 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'pinch' | 'point' | 'double-pinch';
    x?: number;
    y?: number;
    confidence: number;
}

interface HandLandmark {
    x: number;
    y: number;
    z: number;
}

// Use global MediaPipe loaded from CDN (loaded on-demand)
declare global {
    interface Window {
        Hands: any;
        Camera: any;
    }
}

const ensureScript = (() => {
    const cache: Record<string, Promise<void>> = {};

    return (id: string, src: string) => {
        if (cache[id]) return cache[id];

        cache[id] = new Promise<void>((resolve, reject) => {
            const existing = document.getElementById(id) as HTMLScriptElement | null;
            if (existing) {
                // If already loaded, resolve immediately; otherwise wait for it.
                if ((existing as any).dataset.loaded === 'true') return resolve();
                existing.addEventListener('load', () => resolve(), { once: true });
                existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.id = id;
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.async = true;
            script.onload = () => {
                (script as any).dataset.loaded = 'true';
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });

        return cache[id];
    };
})();

const ensureMediaPipeLoaded = async () => {
    // Keep order for compatibility (matches previous index.html order)
    await ensureScript(
        'mediapipe-camera-utils',
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'
    );
    await ensureScript(
        'mediapipe-control-utils',
        'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js'
    );
    await ensureScript(
        'mediapipe-drawing-utils',
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'
    );
    await ensureScript(
        'mediapipe-hands',
        'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
    );

    if (!window.Hands || !window.Camera) {
        throw new Error('MediaPipe failed to initialize');
    }
};

export const useHandGestures = (enabled: boolean) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const handsRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const [gesture, setGesture] = useState<GestureEvent | null>(null);

    const prevPositionRef = useRef<{ x: number; y: number } | null>(null);
    const lastGestureTimeRef = useRef<number>(0);
    const lastPinchTimeRef = useRef<number>(0);

    const calculateDistance = (point1: HandLandmark, point2: HandLandmark): number => {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = point1.z - point2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    const detectPinch = (landmarks: HandLandmark[]): boolean => {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = calculateDistance(thumbTip, indexTip);
        return distance < 0.05;
    };

    const detectPoint = (landmarks: HandLandmark[]): boolean => {
        const indexTip = landmarks[8];
        const indexBase = landmarks[5];
        const middleTip = landmarks[12];
        const middleBase = landmarks[9];

        const indexExtended = (indexTip.y < indexBase.y);
        const middleCurled = (middleTip.y > middleBase.y);

        return indexExtended && middleCurled;
    };

    const detectSwipe = (currentX: number, currentY: number): GestureEvent | null => {
        if (!prevPositionRef.current) {
            prevPositionRef.current = { x: currentX, y: currentY };
            return null;
        }

        const deltaX = currentX - prevPositionRef.current.x;
        const deltaY = currentY - prevPositionRef.current.y;
        const threshold = 0.15;

        let gestureType: GestureEvent['type'] | null = null;

        if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
            gestureType = deltaX > 0 ? 'swipe-right' : 'swipe-left';
        } else if (Math.abs(deltaY) > threshold && Math.abs(deltaY) > Math.abs(deltaX)) {
            gestureType = deltaY > 0 ? 'swipe-down' : 'swipe-up';
        }

        prevPositionRef.current = { x: currentX, y: currentY };

        if (gestureType) {
            return {
                type: gestureType,
                x: currentX,
                y: currentY,
                confidence: Math.min(Math.abs(deltaX), Math.abs(deltaY)) / threshold
            };
        }

        return null;
    };

    const onResults = useCallback((results: any) => {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            prevPositionRef.current = null;
            return;
        }

        const landmarks = results.multiHandLandmarks[0];
        const now = Date.now();

        if (now - lastGestureTimeRef.current < 300) {
            return;
        }

        const palmCenter = landmarks[9];

        if (detectPinch(landmarks)) {
            const timeSinceLastPinch = now - lastPinchTimeRef.current;
            const isDoublePinch = timeSinceLastPinch < 500;

            const x = 1 - landmarks[8].x;
            const y = landmarks[8].y;

            setGesture({
                type: isDoublePinch ? 'double-pinch' : 'pinch',
                x,
                y,
                confidence: 0.9
            });

            lastPinchTimeRef.current = now;
            lastGestureTimeRef.current = now;
            return;
        }

        if (detectPoint(landmarks)) {
            const x = 1 - landmarks[8].x;
            const y = landmarks[8].y;

            setGesture({
                type: 'point',
                x,
                y,
                confidence: 0.85
            });
            lastGestureTimeRef.current = now;
            return;
        }

        const swipeGesture = detectSwipe(palmCenter.x, palmCenter.y);
        if (swipeGesture) {
            setGesture(swipeGesture);
            lastGestureTimeRef.current = now;
        }
    }, []);

    useEffect(() => {
        if (!enabled) {
            // Immediate cleanup when disabled
            try {
                console.log('[HandGestures] Disabled - cleaning up immediately');

                if (cameraRef.current) {
                    cameraRef.current.stop();
                    cameraRef.current = null;
                }
                if (handsRef.current) {
                    handsRef.current.close();
                    handsRef.current = null;
                }
                if (videoRef.current && document.body.contains(videoRef.current)) {
                    document.body.removeChild(videoRef.current);
                }
                videoRef.current = null;
            } catch (e) {
                console.warn('[HandGestures] Cleanup on disable error:', e);
            }
            setIsReady(false);
            setGesture(null);
            return;
        }

        const initializeHands = async () => {
            try {
                console.log('[HandGestures] Starting initialization...');

                await ensureMediaPipeLoaded();

                console.log('[HandGestures] MediaPipe loaded');

                const video = document.createElement('video');
                video.style.display = 'none';
                document.body.appendChild(video);
                videoRef.current = video;

                const hands = new window.Hands({
                    locateFile: (file: string) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    }
                });

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.7
                });

                hands.onResults(onResults);
                handsRef.current = hands;

                console.log('[HandGestures] Starting camera...');

                const camera = new window.Camera(video, {
                    onFrame: async () => {
                        if (handsRef.current) {
                            await handsRef.current.send({ image: video });
                        }
                    },
                    width: 640,
                    height: 480
                });

                await camera.start();
                cameraRef.current = camera;

                console.log('[HandGestures] ✅ Initialization complete!');
                setIsReady(true);
            } catch (error) {
                console.error('[HandGestures] ❌ Initialization failed:', error);
            }
        };

        initializeHands();

        return () => {
            try {
                console.log('[HandGestures] Cleaning up...');

                if (cameraRef.current) {
                    try {
                        cameraRef.current.stop();
                    } catch (e) {
                        console.warn('[HandGestures] Camera stop error:', e);
                    }
                }

                if (handsRef.current) {
                    try {
                        handsRef.current.close();
                    } catch (e) {
                        console.warn('[HandGestures] Hands close error:', e);
                    }
                }

                if (videoRef.current && document.body.contains(videoRef.current)) {
                    try {
                        document.body.removeChild(videoRef.current);
                    } catch (e) {
                        console.warn('[HandGestures] Video remove error:', e);
                    }
                }

                console.log('[HandGestures] ✅ Cleanup complete');
            } catch (error) {
                console.error('[HandGestures] Cleanup failed:', error);
            }
        };
    }, [enabled, onResults]);

    return {
        isReady,
        gesture,
        videoElement: videoRef.current
    };
};
