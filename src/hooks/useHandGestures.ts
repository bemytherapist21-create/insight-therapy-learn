import { useEffect, useRef, useState, useCallback } from 'react';
import * as mediapipeHands from '@mediapipe/hands';
import * as mediapipeCamera from '@mediapipe/camera_utils';

// Handle both ESM and CJS imports
const Hands = (mediapipeHands as any).Hands || mediapipeHands;
const Camera = (mediapipeCamera as any).Camera || mediapipeCamera;
type Results = mediapipeHands.Results;

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

export const useHandGestures = (enabled: boolean) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const handsRef = useRef<Hands | null>(null);
    const cameraRef = useRef<Camera | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [gesture, setGesture] = useState<GestureEvent | null>(null);

    // Previous hand position for swipe detection
    const prevPositionRef = useRef<{ x: number; y: number } | null>(null);
    const lastGestureTimeRef = useRef<number>(0);
    const lastPinchTimeRef = useRef<number>(0);

    // Calculate distance between two landmarks
    const calculateDistance = (point1: HandLandmark, point2: HandLandmark): number => {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = point1.z - point2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    // Detect pinch gesture (thumb tip close to index finger tip)
    const detectPinch = (landmarks: HandLandmark[]): boolean => {
        const thumbTip = landmarks[4];  // Thumb tip
        const indexTip = landmarks[8];  // Index finger tip
        const distance = calculateDistance(thumbTip, indexTip);
        return distance < 0.05; // Threshold for pinch
    };

    // Detect point gesture (only index finger extended)
    const detectPoint = (landmarks: HandLandmark[]): boolean => {
        const indexTip = landmarks[8];
        const indexBase = landmarks[5];
        const middleTip = landmarks[12];
        const middleBase = landmarks[9];

        // Index finger should be extended
        const indexExtended = (indexTip.y < indexBase.y);
        // Middle finger should be curled
        const middleCurled = (middleTip.y > middleBase.y);

        return indexExtended && middleCurled;
    };

    // Detect swipe gestures
    const detectSwipe = (currentX: number, currentY: number): GestureEvent | null => {
        if (!prevPositionRef.current) {
            prevPositionRef.current = { x: currentX, y: currentY };
            return null;
        }

        const deltaX = currentX - prevPositionRef.current.x;
        const deltaY = currentY - prevPositionRef.current.y;
        const threshold = 0.15; // Minimum movement to detect swipe

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

    // Process hand landmarks and detect gestures
    const onResults = useCallback((results: Results) => {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            prevPositionRef.current = null;
            return;
        }

        const landmarks = results.multiHandLandmarks[0];
        const now = Date.now();

        // Throttle gesture detection to avoid spam
        if (now - lastGestureTimeRef.current < 300) {
            return;
        }

        // Get palm center for swipe detection
        const palmCenter = landmarks[9]; // Middle finger base (palm center approximation)

        // Detect pinch
        if (detectPinch(landmarks)) {
            const timeSinceLastPinch = now - lastPinchTimeRef.current;
            const isDoublePinch = timeSinceLastPinch < 500;

            // Apply mirror fix (flip X horizontally)
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

        // Detect point
        if (detectPoint(landmarks)) {
            // Apply mirror fix (flip X horizontally)
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

        // Detect swipe
        const swipeGesture = detectSwipe(palmCenter.x, palmCenter.y);
        if (swipeGesture) {
            setGesture(swipeGesture);
            lastGestureTimeRef.current = now;
        }
    }, []);

    // Initialize MediaPipe Hands
    useEffect(() => {
        if (!enabled) {
            // Cleanup if disabled
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
                console.log('[HandGestures] Starting MediaPipe initialization...');

                // Create video element
                const video = document.createElement('video');
                video.style.display = 'none';
                document.body.appendChild(video);
                videoRef.current = video;

                console.log('[HandGestures] Initializing MediaPipe Hands...');

                // Initialize MediaPipe Hands
                const hands = new Hands({
                    locateFile: (file) => {
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

                // Initialize camera
                const camera = new Camera(video, {
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
                if (error instanceof Error) {
                    console.error('[HandGestures] Error details:', {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    });
                }
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
        videoElement: videoRef.current
    };
};
