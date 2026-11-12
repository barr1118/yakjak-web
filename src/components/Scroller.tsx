"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

interface ScrollerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Horizontal scroller used for category chips & featured carousel.
 * - Native touch swipe on mobile (touch-action + momentum scrolling)
 * - Mouse drag-to-scroll on desktop / mobile-simulator
 * - Scrollbar hidden via CSS (.scroll-x), content still scrolls on hover/wheel
 * - Suppresses link clicks when the gesture was a drag, not a tap
 */
const Scroller = forwardRef<HTMLDivElement, ScrollerProps>(function Scroller(
  { children, className = "", ...rest },
  outerRef,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      innerRef.current = el;
      if (typeof outerRef === "function") outerRef(el);
      else if (outerRef) outerRef.current = el;
    },
    [outerRef],
  );

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const state = drag.current;

    const onPointerDown = (e: PointerEvent) => {
      // Touch swipes are handled natively by the browser; only mouse needs help
      // (real trackpads use wheel, simulators use mouse drag).
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      state.down = true;
      state.moved = false;
      state.startX = e.clientX;
      state.startScroll = el.scrollLeft;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!state.down) return;
      const dx = e.clientX - state.startX;
      if (Math.abs(dx) > 6) {
        state.moved = true;
        el.classList.add("dragging");
        el.scrollLeft = state.startScroll - dx;
      }
    };
    const endDrag = () => {
      state.down = false;
      el.classList.remove("dragging");
    };
    // A drag ending on a card must not trigger navigation.
    const onClickCapture = (e: MouseEvent) => {
      if (state.moved) {
        e.preventDefault();
        e.stopPropagation();
        state.moved = false;
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    el.addEventListener("click", onClickCapture, true);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return (
    <div ref={setRef} {...rest} className={`scroll-x ${className}`}>
      {children}
    </div>
  );
});

export default Scroller;
