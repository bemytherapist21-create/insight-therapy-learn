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

// MediaPipe loaded from CDN (see index.html)
declare global {
    interface Window {
        Hands: new (config: { locateFile: (file: string) => string }) => {
            setOptions: (opts: object) => void;
            onResults: (cb: (results: { multiHandLandmarks?: HandLandmark[][] }) => void) => void;
            send: (opts: { image: HTMLVideoElement }) => Promise<void>;
            close: () => Promise<void>;
        };
        Camera: new (
            video: HTMLVideoElement,
            config: { onFrame: () => Promise<void>; width: number; height: number }
        ) => {
            start: () => Promise<void>;
            stop: () => void;
        };
    }
}

export const useHandGestures = (enabled: boolean) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const handsRef = useRef<InstanceType<typeof window.Hands> | null>(null);
    const cameraRef = useRef<InstanceType<typeof window.Camera> | null>(null);
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

        const indexExtended = indexTip.y < indexBase.y;
        const middleCurled = middleTip.y > middleBase.y;

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
                confidence: Math.min(Math.abs(deltaX), Math.abs(deltaY)) / threshold,
            };
        }

        return null;
    };

    const onResults = useCallback((results: { multiHandLandmarks?: HandLandmark[][] }) => {
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

            // Mirror fix: camera shows mirrored view
            const x = 1 - landmarks[8].x;
            const y = landmarks[8].y;

            setGesture({
                type: isDoublePinch ? 'double-pinch' : 'pinch',
                x,
                y,
                confidence: 0.9,
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
                confidence: 0.85,
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
            if (cameraRef.current) {
                cameraRef.current.stop();
            }
            if (handsRef.current) {
                handsRef.current.close();
            }
            setIsReady(false);
            return;
        }

        const initializeHands = async () => {
            try {
                // Wait for MediaPipe to load from CDN
                let attempts = 0;
                while (!window.Hands && attempts < 50) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    attempts++;
                }

                if (!window.Hands) {
                    throw new Error('MediaPipe Hands not loaded from CDN');
                }

                const video = document.createElement('video');
                video.style.display = 'none';
                document.body.appendChild(video);
                videoRef.current = video;

                const hands = new window.Hands({
                    locateFile: (file: string) =>
                        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
                });

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.7,
                });

                hands.onResults(onResults);
                handsRef.current = hands;

                const camera = new window.Camera(video, {
                    onFrame: async () => {
                        if (handsRef.current) {
                            await handsRef.current.send({ image: video });
                        }
                    },
                    width: 640,
                    height: 480,
                });

                await camera.start();
                cameraRef.current = camera;
                setIsReady(true);
            } catch (error) {
                console.error('[HandGestures] Initialization failed:', error);
            }
        };

        initializeHands();

        return () => {
            if (cameraRef.current) {
                cameraRef.current.stop();
            }
            if (handsRef.current) {
                handsRef.current.close();
            }
            if (videoRef.current && document.body.contains(videoRef.current)) {
                document.body.removeChild(videoRef.current);
            }
        };
    }, [enabled, onResults]);

    return {
        isReady,
        gesture,
        videoElement: videoRef.current,
    };
};
