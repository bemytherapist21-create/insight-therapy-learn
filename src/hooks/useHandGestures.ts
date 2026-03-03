import { useEffect, useRef, useState, useCallback } from "react";

export interface GestureEvent {
  type:
  | "swipe-left"
  | "swipe-right"
  | "swipe-up"
  | "swipe-down"
  | "pinch"
  | "point"
  | "double-pinch"
  | "drag";
  x?: number;
  y?: number;
  confidence: number;
  timestamp?: number; // Add timestamp to prevent duplicate processing
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
        if ((existing as any).dataset.loaded === "true") return resolve();
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error(`Failed to load script: ${src}`)),
          { once: true },
        );
        return;
      }

      const script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.crossOrigin = "anonymous";
      script.async = true;
      script.onload = () => {
        (script as any).dataset.loaded = "true";
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
    "mediapipe-camera-utils",
    "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
  );
  await ensureScript(
    "mediapipe-control-utils",
    "https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js",
  );
  await ensureScript(
    "mediapipe-drawing-utils",
    "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
  );
  await ensureScript(
    "mediapipe-hands",
    "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
  );

  if (!window.Hands || !window.Camera) {
    throw new Error("MediaPipe failed to initialize");
  }
};

export const useHandGestures = (enabled: boolean) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [gesture, setGesture] = useState<GestureEvent | null>(null);
  const [handPosition, setHandPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const prevPositionRef = useRef<{ x: number; y: number } | null>(null);
  const lastGestureTimeRef = useRef<number>(0);

  // Refs for pinch-drag scrolling
  const isPinchingRef = useRef(false);
  const pinchStartYRef = useRef<number>(0);
  
  // Ref to track if component is mounted (prevents state updates after unmount)
  const isMountedRef = useRef(true);
  
  // Keep enabled state in ref to prevent stale closures
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const calculateDistance = (
    point1: HandLandmark,
    point2: HandLandmark,
  ): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  // 2-finger pinch: index + thumb (for clicking)
  const detectTwoFingerPinch = (landmarks: HandLandmark[]): boolean => {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];

    const thumbIndexDistance = calculateDistance(thumbTip, indexTip);
    const thumbMiddleDistance = calculateDistance(thumbTip, middleTip);

    // Index touching thumb, but middle NOT touching thumb
    return thumbIndexDistance < 0.05 && thumbMiddleDistance > 0.08;
  };

  // 3-finger pinch: index + middle + thumb (for scrolling)
  const detectThreeFingerPinch = (landmarks: HandLandmark[]): boolean => {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];

    const thumbIndexDistance = calculateDistance(thumbTip, indexTip);
    const thumbMiddleDistance = calculateDistance(thumbTip, middleTip);

    // Both index AND middle touching thumb
    return thumbIndexDistance < 0.05 && thumbMiddleDistance < 0.05;
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

  const detectSwipe = (
    currentX: number,
    currentY: number,
  ): GestureEvent | null => {
    if (!prevPositionRef.current) {
      prevPositionRef.current = { x: currentX, y: currentY };
      return null;
    }

    const deltaX = currentX - prevPositionRef.current.x;
    const deltaY = currentY - prevPositionRef.current.y;
    const threshold = 0.15;

    let gestureType: GestureEvent["type"] | null = null;

    // Only detect horizontal swipes (for navigation)
    // Vertical swipes disabled - use pinch-drag for scrolling
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      gestureType = deltaX > 0 ? "swipe-right" : "swipe-left";
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

  const onResults = useCallback((results: any) => {
    // Check if still mounted and enabled to prevent stale state updates
    if (!isMountedRef.current || !enabledRef.current) {
      return;
    }
    
    if (
      !results.multiHandLandmarks ||
      results.multiHandLandmarks.length === 0
    ) {
      prevPositionRef.current = null;
      setHandPosition(null);
      // Reset pinch state when hand is lost
      isPinchingRef.current = false;
      setIsDragging(false);
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const now = Date.now();

    // Always update hand position for cursor (using index finger tip)
    const indexTip = landmarks[8];
    const cursorX = (1 - indexTip.x) * window.innerWidth; // Flip horizontally (mirror)
    const cursorY = indexTip.y * window.innerHeight;
    setHandPosition({ x: cursorX, y: cursorY });

    const palmCenter = landmarks[9];

    // Check for 2-finger pinch (click)
    const isTwoFingerPinch = detectTwoFingerPinch(landmarks);
    // Check for 3-finger pinch (scroll)
    const isThreeFingerPinch = detectThreeFingerPinch(landmarks);

    if (isTwoFingerPinch) {
      // 2-finger pinch = single click - use 350ms debounce to prevent double triggers
      if (now - lastGestureTimeRef.current >= 350) {
        const x = 1 - landmarks[8].x;
        const y = landmarks[8].y;

        setGesture({
          type: "pinch",
          x,
          y,
          confidence: 0.9,
          timestamp: now, // Add timestamp to identify unique gestures
        });
        lastGestureTimeRef.current = now;
      }
      return;
    }

    if (isThreeFingerPinch) {
      // 3-finger pinch = scroll mode
      if (!isPinchingRef.current) {
        // Scroll pinch just started
        isPinchingRef.current = true;
        pinchStartYRef.current = indexTip.y;
        setIsDragging(false);
      } else {
        // Continuing 3-finger pinch - detect drag for scrolling
        const currentY = indexTip.y;
        const deltaY = (currentY - pinchStartYRef.current) * window.innerHeight;

        // Increase threshold to reduce jitter
        if (Math.abs(deltaY) > 8) {
          setIsDragging(true);
          setGesture({ type: "drag", y: deltaY, confidence: 0.9, timestamp: now });
          pinchStartYRef.current = currentY; // Update for continuous scrolling
        }
      }
      return;
    } else {
      // No pinch - release scroll mode
      if (isPinchingRef.current) {
        isPinchingRef.current = false;
        setIsDragging(false);
      }
    }

    // Increase debounce for other gestures to reduce false triggers
    if (now - lastGestureTimeRef.current < 350) {
      return;
    }

    if (detectPoint(landmarks)) {
      const x = 1 - landmarks[8].x;
      const y = landmarks[8].y;

      setGesture({
        type: "point",
        x,
        y,
        confidence: 0.85,
        timestamp: now,
      });
      lastGestureTimeRef.current = now;
      return;
    }

    const swipeGesture = detectSwipe(palmCenter.x, palmCenter.y);
    if (swipeGesture) {
      setGesture({ ...swipeGesture, timestamp: now });
      lastGestureTimeRef.current = now;
    }
  }, []);

  useEffect(() => {
    // Mark as mounted
    isMountedRef.current = true;
    
    if (!enabled) {
      // Immediate cleanup when disabled
      try {
        console.log("[HandGestures] Disabled - cleaning up immediately");

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
        console.warn("[HandGestures] Cleanup on disable error:", e);
      }
      setIsReady(false);
      setGesture(null);
      setHandPosition(null);
      setIsDragging(false);
      isPinchingRef.current = false;
      prevPositionRef.current = null;
      return;
    }

    const initializeHands = async () => {
      try {
        console.log("[HandGestures] Starting initialization...");

        await ensureMediaPipeLoaded();

        console.log("[HandGestures] MediaPipe loaded");

        const video = document.createElement("video");
        video.style.display = "none";
        document.body.appendChild(video);
        videoRef.current = video;

        const hands = new window.Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        console.log("[HandGestures] Starting camera...");

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

        console.log("[HandGestures] ✅ Initialization complete!");
        setIsReady(true);
      } catch (error) {
        console.error("[HandGestures] ❌ Initialization failed:", error);
      }
    };

    initializeHands();

    return () => {
      // Mark as unmounted to prevent stale state updates
      isMountedRef.current = false;
      
      try {
        console.log("[HandGestures] Cleaning up...");

        if (cameraRef.current) {
          try {
            cameraRef.current.stop();
          } catch (e) {
            console.warn("[HandGestures] Camera stop error:", e);
          }
          cameraRef.current = null;
        }

        if (handsRef.current) {
          try {
            handsRef.current.close();
          } catch (e) {
            console.warn("[HandGestures] Hands close error:", e);
          }
          handsRef.current = null;
        }

        if (videoRef.current && document.body.contains(videoRef.current)) {
          try {
            document.body.removeChild(videoRef.current);
          } catch (e) {
            console.warn("[HandGestures] Video remove error:", e);
          }
        }
        videoRef.current = null;

        console.log("[HandGestures] ✅ Cleanup complete");
      } catch (error) {
        console.error("[HandGestures] Cleanup failed:", error);
      }
    };
  }, [enabled, onResults]);

  return {
    isReady,
    gesture,
    handPosition,
    isDragging,
    videoElement: videoRef.current,
  };
};
