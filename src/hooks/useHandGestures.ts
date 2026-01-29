import { useEffect, useRef, useState, useCallback } from 'react';

export interface GestureEvent {
    type: 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'click';
    x?: number;
    y?: number;
    confidence: number;
}

export const useHandGestures = (enabled: boolean) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [gesture, setGesture] = useState<GestureEvent | null>(null);

    const prevFrameRef = useRef<ImageData | null>(null);
    const motionCenterRef = useRef<{ x: number; y: number } | null>(null);
    const lastGestureTimeRef = useRef<number>(0);

    // Detect motion in video frames
    const detectMotion = useCallback((currentFrame: ImageData) => {
        if (!prevFrameRef.current) {
            prevFrameRef.current = currentFrame;
            return null;
        }

        const prev = prevFrameRef.current.data;
        const curr = currentFrame.data;
        const width = currentFrame.width;
        const height = currentFrame.height;

        // Calculate motion by comparing pixels
        let motionX = 0;
        let motionY = 0;
        let motionPixels = 0;
        const threshold = 30; // Motion sensitivity

        // Sample pixels (not every pixel for performance)
        for (let y = 0; y < height; y += 10) {
            for (let x = 0; x < width; x += 10) {
                const i = (y * width + x) * 4;
                const diff = Math.abs(curr[i] - prev[i]) +
                    Math.abs(curr[i + 1] - prev[i + 1]) +
                    Math.abs(curr[i + 2] - prev[i + 2]);

                if (diff > threshold) {
                    motionX += x;
                    motionY += y;
                    motionPixels++;
                }
            }
        }

        prevFrameRef.current = currentFrame;

        if (motionPixels < 50) return null; // Not enough motion

        // Calculate center of motion
        const centerX = motionX / motionPixels / width;
        const centerY = motionY / motionPixels / height;

        return { x: centerX, y: centerY, strength: motionPixels };
    }, []);

    // Detect gestures from motion
    const detectGesture = useCallback((motion: { x: number; y: number; strength: number } | null) => {
        if (!motion) {
            motionCenterRef.current = null;
            return;
        }

        const now = Date.now();

        // Detect swipes
        if (motionCenterRef.current && now - lastGestureTimeRef.current > 500) {
            const deltaX = motion.x - motionCenterRef.current.x;
            const deltaY = motion.y - motionCenterRef.current.y;
            const threshold = 0.2;

            if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
                setGesture({
                    type: deltaX > 0 ? 'swipe-right' : 'swipe-left',
                    x: motion.x,
                    y: motion.y,
                    confidence: Math.min(motion.strength / 500, 1)
                });
                lastGestureTimeRef.current = now;
            } else if (Math.abs(deltaY) > threshold && Math.abs(deltaY) > Math.abs(deltaX)) {
                setGesture({
                    type: deltaY > 0 ? 'swipe-down' : 'swipe-up',
                    x: motion.x,
                    y: motion.y,
                    confidence: Math.min(motion.strength / 500, 1)
                });
                lastGestureTimeRef.current = now;
            }
        }

        // Detect click (sudden motion stop)
        if (motion.strength < 100 && motionCenterRef.current && now - lastGestureTimeRef.current > 500) {
            setGesture({
                type: 'click',
                x: motionCenterRef.current.x,
                y: motionCenterRef.current.y,
                confidence: 0.7
            });
            lastGestureTimeRef.current = now;
        }

        motionCenterRef.current = { x: motion.x, y: motion.y };
    }, []);

    // Process video frames
    const processFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !enabled) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
            requestAnimationFrame(processFrame);
            return;
        }

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get frame data
        const frameData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Detect motion
        const motion = detectMotion(frameData);
        detectGesture(motion);

        requestAnimationFrame(processFrame);
    }, [enabled, detectMotion, detectGesture]);

    // Initialize camera
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

        const initializeCamera = async () => {
            try {
                // Create video element
                const video = document.createElement('video');
                video.width = 320; // Low resolution for performance
                video.height = 240;
                video.autoplay = true;
                video.playsInline = true;
                videoRef.current = video;

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = 320;
                canvas.height = 240;
                canvas.style.display = 'none';
                document.body.appendChild(canvas);
                canvasRef.current = canvas;

                // Get camera stream
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240, facingMode: 'user' }
                });

                video.srcObject = stream;
                await video.play();

                setIsReady(true);
                processFrame();
            } catch (error) {
                console.error('Failed to initialize camera:', error);
            }
        };

        initializeCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            if (canvasRef.current && document.body.contains(canvasRef.current)) {
                document.body.removeChild(canvasRef.current);
            }
        };
    }, [enabled, processFrame]);

    return {
        isReady,
        gesture,
        videoElement: videoRef.current
    };
};
