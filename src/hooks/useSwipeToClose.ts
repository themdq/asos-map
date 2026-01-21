import { useState, useRef, useCallback } from 'react';

interface SwipeConfig {
  threshold?: number;
  direction?: 'left' | 'right';
  mobileOnly?: boolean;
}

interface UseSwipeToCloseReturn {
  swipeX: number;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
  style: React.CSSProperties;
}

export function useSwipeToClose(
  onClose: (() => void) | undefined,
  config: SwipeConfig = {}
): UseSwipeToCloseReturn {
  const { threshold = 100, direction = 'left', mobileOnly = true } = config;

  const [swipeX, setSwipeX] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isSwipingRef = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    isSwipingRef.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;

    // Determine swipe direction (only if horizontal > vertical)
    if (!isSwipingRef.current && Math.abs(deltaX) > 10) {
      isSwipingRef.current = Math.abs(deltaX) > Math.abs(deltaY);
    }

    // Check mobile-only restriction
    if (mobileOnly && window.innerWidth >= 768) return;

    // Apply swipe based on direction
    if (isSwipingRef.current) {
      if (direction === 'left' && deltaX < 0) {
        setSwipeX(deltaX);
      } else if (direction === 'right' && deltaX > 0) {
        setSwipeX(deltaX);
      }
    }
  }, [direction, mobileOnly]);

  const onTouchEnd = useCallback(() => {
    const shouldClose = direction === 'left'
      ? swipeX < -threshold
      : swipeX > threshold;

    if (shouldClose && onClose) {
      onClose();
    }

    setSwipeX(0);
    touchStartRef.current = null;
    isSwipingRef.current = false;
  }, [swipeX, threshold, direction, onClose]);

  const style: React.CSSProperties = {
    transform: swipeX !== 0 ? `translateX(${swipeX}px)` : undefined,
    transition: swipeX === 0 ? 'transform 0.2s ease-out' : 'none',
  };

  return {
    swipeX,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    style,
  };
}
