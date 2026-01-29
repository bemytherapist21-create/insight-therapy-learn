import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useHandGestures, GestureEvent } from "@/hooks/useHandGestures";
import { Hand, X, MousePointer2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HandGestureOverlayProps {
  enabled: boolean;
  onToggle: () => void;
}

// Helper to find the best clickable element
const findClickableElement = (element: HTMLElement): HTMLElement | null => {
  const tagName = element.tagName.toLowerCase();

  // Direct clickable elements
  const isClickable = [
    "button",
    "a",
    "input",
    "select",
    "textarea",
    "label",
    "summary",
  ].includes(tagName);

  // Event handlers
  const hasClickHandler =
    element.onclick !== null ||
    element.getAttribute("onclick") !== null ||
    element.hasAttribute("onmousedown") ||
    element.hasAttribute("onpointerdown");

  // ARIA roles
  const hasRole = [
    "button",
    "link",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "tab",
    "checkbox",
    "radio",
    "switch",
    "option",
    "treeitem",
  ].includes(element.getAttribute("role") || "");

  // Interactive styling
  const computedStyle = window.getComputedStyle(element);
  const hasCursorPointer = computedStyle.cursor === "pointer";

  // Data attributes (including Radix UI patterns)
  const hasDataAction =
    element.hasAttribute("data-action") ||
    element.hasAttribute("data-testid") ||
    element.hasAttribute("data-state") ||
    element.hasAttribute("data-radix-collection-item");

  // Focusable elements
  const isFocusable =
    element.hasAttribute("tabindex") &&
    element.getAttribute("tabindex") !== "-1";

  if (
    isClickable ||
    hasClickHandler ||
    hasRole ||
    hasCursorPointer ||
    hasDataAction ||
    isFocusable
  ) {
    return element;
  }

  // Expanded parent search
  const clickableParent = element.closest(
    'button, a, [role="button"], [role="menuitem"], [role="link"], [role="tab"], ' +
      '[onclick], [onmousedown], label, [tabindex]:not([tabindex="-1"]), ' +
      "[data-action], [data-state], summary",
  ) as HTMLElement | null;

  return clickableParent;
};

// Show click ripple effect at position
const showClickRipple = (x: number, y: number) => {
  const ripple = document.createElement("div");
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

export const HandGestureOverlay = ({
  enabled,
  onToggle,
}: HandGestureOverlayProps) => {
  const { isReady, gesture, handPosition, isDragging } =
    useHandGestures(enabled);
  const [isPinching, setIsPinching] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Track pinch state for cursor styling
  useEffect(() => {
    if (gesture?.type === "pinch" || gesture?.type === "double-pinch") {
      setIsPinching(true);
      const timer = setTimeout(() => setIsPinching(false), 200);
      return () => clearTimeout(timer);
    }
  }, [gesture]);

  // Handle gestures
  useEffect(() => {
    if (!gesture) return;

    const handleGesture = (gestureEvent: GestureEvent) => {
      switch (gestureEvent.type) {
        case "swipe-left":
          window.history.back();
          break;
        case "swipe-right":
          window.history.forward();
          break;
        case "swipe-up":
          window.scrollBy({ top: -100, behavior: "smooth" });
          break;
        case "swipe-down":
          window.scrollBy({ top: 100, behavior: "smooth" });
          break;
        case "drag":
          if (gestureEvent.y !== undefined) {
            const scrollAmount = gestureEvent.y * 2.5; // Sensitivity multiplier
            window.scrollBy({ top: scrollAmount, behavior: "auto" });
          }
          break;
        case "pinch":
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
                const mouseEvent = new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                  clientX: x,
                  clientY: y,
                });
                clickable.dispatchEvent(mouseEvent);
              }
            }
          }
          break;
        case "double-pinch":
          if (gestureEvent.x !== undefined && gestureEvent.y !== undefined) {
            // x is already flipped in the hook, just scale to screen
            const x = gestureEvent.x * window.innerWidth;
            const y = gestureEvent.y * window.innerHeight;
            showClickRipple(x, y);

            const element = document.elementFromPoint(x, y);
            if (element && element instanceof HTMLElement) {
              const clickable = findClickableElement(element);
              if (clickable) {
                const event = new MouseEvent("dblclick", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                  clientX: x,
                  clientY: y,
                });
                clickable.dispatchEvent(event);
              }
            }
          }
          break;
        case "point":
          if (gestureEvent.x !== undefined && gestureEvent.y !== undefined) {
            // x is already flipped in the hook, just scale to screen
            const x = gestureEvent.x * window.innerWidth;
            const y = gestureEvent.y * window.innerHeight;
            const element = document.elementFromPoint(x, y);
            if (element && element instanceof HTMLElement) {
              const clickable = findClickableElement(element);
              if (clickable) {
                clickable.style.outline = "2px solid #8b5cf6";
                clickable.style.outlineOffset = "2px";
                setTimeout(() => {
                  clickable.style.outline = "";
                  clickable.style.outlineOffset = "";
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

  // Render cursor via portal to escape all stacking contexts
  const cursorElement =
    handPosition && isReady ? (
      <div
        style={{
          position: "fixed",
          left: handPosition.x,
          top: handPosition.y,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 2147483647, // Max z-index value
          transition: "left 75ms ease-out, top 75ms ease-out",
        }}
      >
        {/* Outer ring */}
        <div
          className={`absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-150 ${
            isDragging
              ? "border-blue-400 bg-blue-400/30 scale-90"
              : isPinching
                ? "border-green-400 bg-green-400/30 scale-75"
                : "border-purple-400 bg-purple-400/20"
          }`}
        />

        {/* Inner dot */}
        <div
          className={`absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-150 ${
            isDragging
              ? "bg-blue-400 scale-125"
              : isPinching
                ? "bg-green-400 scale-150"
                : "bg-purple-500"
          }`}
        />

        {/* Pointer/Grip icon */}
        {isDragging ? (
          <GripVertical className="absolute w-5 h-5 translate-x-1 translate-y-1 text-blue-300 drop-shadow-lg" />
        ) : (
          <MousePointer2
            className={`absolute w-5 h-5 translate-x-1 translate-y-1 transition-all duration-150 ${
              isPinching
                ? "text-green-300 scale-90"
                : "text-white drop-shadow-lg"
            }`}
          />
        )}
      </div>
    ) : null;

  return (
    <>
      {/* Render cursor via portal directly to body to escape all stacking contexts */}
      {cursorElement && createPortal(cursorElement, document.body)}
      
      {/* Control Panel */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {/* Experimental Warning */}
        <div className="bg-orange-500/90 backdrop-blur-sm border border-orange-400 rounded-lg px-3 py-2 text-xs text-white">
          <div className="font-bold flex items-center gap-1">
            ⚠️ EXPERIMENTAL FEATURE
          </div>
          <div className="text-orange-100">May impact performance</div>
        </div>

        {/* Help Panel */}
        <div className="bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-white hover:bg-white/5 transition-colors"
          >
            <span className="font-medium">Gesture Controls</span>
            {showHelp ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {showHelp && (
            <div className="px-3 pb-3 space-y-2 text-xs border-t border-purple-500/20 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-mono w-20">Point</span>
                <span className="text-gray-300">Move cursor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-mono w-20">Pinch</span>
                <span className="text-gray-300">Click element</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-mono w-20">Hold+Move</span>
                <span className="text-gray-300">Scroll page</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-mono w-20">Swipe</span>
                <span className="text-gray-300">Navigate</span>
              </div>
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3 bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2">
          <div className="flex items-center gap-2">
            <Hand
              className={`w-5 h-5 ${isReady ? "text-green-400 animate-pulse" : "text-yellow-400"}`}
            />
            <span className="text-sm text-white">
              {isReady ? "Hand Tracking Active" : "Initializing..."}
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
          <div
            className={`backdrop-blur-sm border rounded-lg px-3 py-1 text-xs text-white animate-fade-in ${
              isDragging
                ? "bg-blue-500/20 border-blue-500/50"
                : "bg-purple-500/20 border-purple-500/50"
            }`}
          >
            {isDragging ? "SCROLLING" : gesture.type.replace("-", " ").toUpperCase()}
          </div>
        )}
      </div>
    </>
  );
};
