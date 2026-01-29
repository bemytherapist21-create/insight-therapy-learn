

# Fix Plan: Hand Gesture Navigation - Scroll and Button Selection Issues

## Problems Identified

Based on a thorough analysis of the codebase, I found two main issues with the experimental hand gesture feature:

### Issue 1: Scroll ("Grab-and-Drag") Not Working

The memory documentation (`mem://features/gesture-navigation/grab-and-drag-scrolling`) describes a "Pinch + Hold + Move" scrolling feature, but this **is not implemented** in the current code.

**Current Behavior:**
- The code only handles discrete `swipe-up` and `swipe-down` gestures
- Swipes require a very high threshold (0.15 in normalized units) before triggering
- Each swipe only scrolls by a fixed 100 pixels

**Expected Behavior (per documentation):**
- Pinch and hold for 100ms to enter "drag" mode
- Move hand vertically to scroll proportionally (sensitivity: 2.5x)
- Visual feedback: blue grip icon with "SCROLLING" status indicator

### Issue 2: Some Buttons Not Getting Selected

The `findClickableElement` function has gaps in detecting certain interactive elements:

**Problems found:**
1. The `closest()` selector doesn't include all clickable patterns (missing `[data-action]`, `[data-testid]`, elements with `cursor: pointer`)
2. React Router `<Link>` components render as `<a>` tags but may be nested inside other elements that aren't detected
3. The navigation dropdown menu items use Radix UI's `DropdownMenuItem` which may not match the current selectors
4. Cards wrapped in `<Link>` (like `ServiceCard`) detect the inner `Card` but not always the outer `Link`

---

## Solution Overview

### Part 1: Implement Grab-and-Drag Scrolling

Add the missing "pinch and hold to scroll" functionality:

1. **New gesture type**: Add `"drag"` to the `GestureEvent` type
2. **Track pinch hold duration**: Detect when user holds pinch for >100ms
3. **Continuous scroll**: While in drag mode, translate hand Y movement to page scroll
4. **Visual feedback**: Show blue grip cursor and "SCROLLING" indicator

### Part 2: Improve Button Detection

Enhance the `findClickableElement` function:

1. Expand the `closest()` selector to include more patterns
2. Add detection for elements with `cursor: pointer` style
3. Better handling of nested interactive elements
4. Add fallback for Radix UI components

### Part 3: Add Help Panel

Add a collapsible help panel showing available gestures (as described in the memory).

---

## Technical Implementation

### Changes to `src/hooks/useHandGestures.ts`

```text
1. Add "drag" to GestureEvent type (line 4-11)
2. Add state tracking for pinch hold:
   - pinchStartTimeRef: tracks when pinch started
   - isDraggingRef: tracks if in drag mode
   - dragStartYRef: tracks starting Y position for scroll calculation
3. Update onResults callback to:
   - Detect sustained pinch (>100ms)
   - Emit "drag" gesture with deltaY when in drag mode
   - Reset drag state when pinch released
```

**Key Logic:**
```typescript
// New refs for drag tracking
const pinchStartTimeRef = useRef<number | null>(null);
const isDraggingRef = useRef(false);
const dragStartYRef = useRef<number>(0);

// In onResults, after detectPinch check:
if (detectPinch(landmarks)) {
  if (!pinchStartTimeRef.current) {
    pinchStartTimeRef.current = now;
    dragStartYRef.current = landmarks[8].y;
  }
  
  const holdDuration = now - pinchStartTimeRef.current;
  
  if (holdDuration > 100 && !isDraggingRef.current) {
    isDraggingRef.current = true;
  }
  
  if (isDraggingRef.current) {
    const deltaY = (landmarks[8].y - dragStartYRef.current) * window.innerHeight;
    setGesture({ type: "drag", y: deltaY, confidence: 0.9 });
    dragStartYRef.current = landmarks[8].y; // Reset for next frame
    return;
  }
  // ... existing pinch/double-pinch logic
} else {
  // Reset drag state when pinch released
  pinchStartTimeRef.current = null;
  isDraggingRef.current = false;
}
```

### Changes to `src/components/gestures/HandGestureOverlay.tsx`

```text
1. Add isDragging state for visual feedback
2. Handle "drag" gesture case:
   - Scroll page using window.scrollBy with sensitivity multiplier (2.5)
   - Show "SCROLLING" status indicator
3. Improve findClickableElement function:
   - Expand closest() selector
   - Add tabindex detection
   - Check for data-state attribute (Radix UI)
4. Add collapsible help panel showing gesture controls
```

**Improved findClickableElement:**
```typescript
const findClickableElement = (element: HTMLElement): HTMLElement | null => {
  const tagName = element.tagName.toLowerCase();
  
  // Direct clickable elements
  const isClickable = ["button", "a", "input", "select", "textarea", "label", "summary"].includes(tagName);
  
  // Event handlers
  const hasClickHandler = element.onclick !== null || 
    element.getAttribute("onclick") !== null ||
    element.hasAttribute("onmousedown") ||
    element.hasAttribute("onpointerdown");
  
  // ARIA roles
  const hasRole = ["button", "link", "menuitem", "menuitemcheckbox", "menuitemradio", 
    "tab", "checkbox", "radio", "switch", "option", "treeitem"].includes(
    element.getAttribute("role") || ""
  );
  
  // Interactive styling
  const computedStyle = window.getComputedStyle(element);
  const hasCursorPointer = computedStyle.cursor === "pointer";
  
  // Data attributes (including Radix UI patterns)
  const hasDataAction = element.hasAttribute("data-action") ||
    element.hasAttribute("data-testid") ||
    element.hasAttribute("data-state") ||
    element.hasAttribute("data-radix-collection-item");
  
  // Focusable elements
  const isFocusable = element.hasAttribute("tabindex") && 
    element.getAttribute("tabindex") !== "-1";

  if (isClickable || hasClickHandler || hasRole || hasCursorPointer || hasDataAction || isFocusable) {
    return element;
  }

  // Expanded parent search
  const clickableParent = element.closest(
    'button, a, [role="button"], [role="menuitem"], [role="link"], [role="tab"], ' +
    '[onclick], [onmousedown], label, [tabindex]:not([tabindex="-1"]), ' +
    '[data-action], [data-state], summary'
  ) as HTMLElement | null;
  
  return clickableParent;
};
```

**Drag gesture handling:**
```typescript
case "drag":
  if (gestureEvent.y !== undefined) {
    const scrollAmount = gestureEvent.y * 2.5; // Sensitivity multiplier
    window.scrollBy({ top: scrollAmount, behavior: "auto" });
  }
  break;
```

**Visual feedback for drag mode:**
```typescript
// In cursor element render:
{isDragging ? (
  <GripVertical className="absolute w-5 h-5 text-blue-400" />
) : (
  <MousePointer2 className="..." />
)}

// Status indicator when dragging:
{isDragging && (
  <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/50 rounded-lg px-3 py-1">
    SCROLLING
  </div>
)}
```

**Help Panel Component:**
```typescript
// Collapsible panel showing:
// - Point: Move cursor
// - Pinch: Click
// - Pinch + Move: Scroll
// - Swipe: Navigate
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useHandGestures.ts` | Add "drag" gesture type, implement pinch-hold detection, track drag state |
| `src/components/gestures/HandGestureOverlay.tsx` | Handle drag gesture for scrolling, improve element detection, add visual feedback, add help panel |

---

## Summary of Fixes

1. **Scroll Fix**: Implement the missing "pinch and hold to drag" scrolling feature with 2.5x sensitivity
2. **Button Detection Fix**: Expand the clickable element detection to cover more UI patterns including Radix UI components
3. **Visual Feedback**: Add blue grip cursor icon and "SCROLLING" indicator during drag mode
4. **Help Panel**: Add collapsible gesture controls guide

