import { useEffect, useRef, useState, useCallback } from 'react';
import * as handTrack from 'handtrackjs';

export interface GestureEvent {
    type: 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'pinch' | 'point' | 'double-pinch';
    x?: number;
    y?: number;
    confidence: number;
}

export const useHandGestures = (enabled: boolean) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const modelRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const [gesture, setGesture] = useState<GestureEvent | null>(null);

    // Previous hand position for gesture detection
    const prevPositionRef = useRef<{ x: number; y: number; time: number } | null>(null);
    const lastGestureTimeRef = useRef<number>(0);
    const handStateRef = useRef<'open' | 'closed' | null>(null);

    // Detect gestures from hand predictions
    const detectGesture = useCallback((predictions: any[]) => {
        if (predictions.length === 0) {
            prevPositionRef.current = null;
            handStateRef.current = null;
            return;
        }

        const hand = predictions[0];
        const bbox = hand.bbox;
        const now = Date.now();

        // Calculate hand center
        const x = (bbox[0] + bbox[2] / 2) / videoRef.current!.width;
        const y = (bbox[1] + bbox[3] / 2) / videoRef.current!.height;

        // Detect open/closed hand (pinch simulation)
        const handSize = bbox[2] * bbox[3];
        const isClosed = handSize < 15000; // Threshold for closed hand
        const currentHandState = isClosed ? 'closed' : 'open';

        // Detect pinch (hand closing)
        if (handStateRef.current === 'open' && currentHandState === 'closed') {
            if (now - lastGestureTimeRef.current > 500) {
                setGesture({
                    type: 'pinch',
                    x,
                    y,
                    confidence: hand.score
                });
                lastGestureTimeRef.current = now;
            }
        }

        handStateRef.current = currentHandState;

        // Detect swipes
        if (prevPositionRef.current && now - prevPositionRef.current.time > 100) {
            const deltaX = x - prevPositionRef.current.x;
            const deltaY = y - prevPositionRef.current.y;
            const threshold = 0.15;

            if (now - lastGestureTimeRef.current > 300) {
                if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
                    setGesture({
                        type: deltaX > 0 ? 'swipe-right' : 'swipe-left',
                        x,
                        y,
                        confidence: hand.score
                    });
                    lastGestureTimeRef.current = now;
                } else if (Math.abs(deltaY) > threshold && Math.abs(deltaY) > Math.abs(deltaX)) {
                    setGesture({
                        type: deltaY > 0 ? 'swipe-down' : 'swipe-up',
                        x,
                        y,
                        confidence: hand.score
                    });
                    lastGestureTimeRef.current = now;
                }
            }
        }

        // Detect point gesture (hand visible and moving)
        if (currentHandState === 'open' && now - lastGestureTimeRef.current > 200) {
            setGesture({
                type: 'point',
                x,
                y,
                confidence: hand.score
            });
        }

        prevPositionRef.current = { x, y, time: now };
    }, []);

    // Run detection loop
    const runDetection = useCallback(async () => {
        if (!modelRef.current || !videoRef.current || !canvasRef.current) return;

        const predictions = await modelRef.current.detect(videoRef.current);
        detectGesture(predictions);

        // Draw predictions on canvas for debugging (optional)
        const context = canvasRef.current.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            modelRef.current.renderPredictions(predictions, canvasRef.current, context, videoRef.current);
        }

        if (enabled) {
            requestAnimationFrame(runDetection);
        }
    }, [enabled, detectGesture]);

    // Initialize Handtrack.js
    useEffect(() => {
        if (!enabled) {
            // Cleanup
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            setIsReady(false);
            return;
        }

        const initializeHandTracking = async () => {
            try {
                // Create video element
                const video = document.createElement('video');
                video.width = 640;
                video.height = 480;
                videoRef.current = video;

                // Create canvas for rendering
                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 480;
                canvas.style.display = 'none';
                document.body.appendChild(canvas);
                canvasRef.current = canvas;

                // Load model
                const model = await handTrack.load({
                    flipHorizontal: false, // We'll handle flipping ourselves
                    maxNumHands: 1,
                    iouThreshold: 0.3,
                    scoreThreshold: 0.6
                });
                modelRef.current = model;

                // Start video
                await handTrack.startVideo(video);
                setIsReady(true);

                // Start detection loop
                runDetection();
            } catch (error) {
                console.error('Failed to initialize hand tracking:', error);
            }
        };

        initializeHandTracking();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            if (canvasRef.current && document.body.contains(canvasRef.current)) {
                document.body.removeChild(canvasRef.current);
            }
        };
    }, [enabled, runDetection]);

    return {
        isReady,
        gesture,
        videoElement: videoRef.current
    };
};
