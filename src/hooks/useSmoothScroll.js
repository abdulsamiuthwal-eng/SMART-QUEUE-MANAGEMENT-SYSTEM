import { useEffect } from 'react';

/**
 * Ultra-performance Butter-Smooth Momentum Scrolling Hook
 * Delivers silky 60-120fps inertia gliding without heavy dependencies.
 * Automatically avoids collisions with nested scrollables and touch screens.
 */
export const useSmoothScroll = () => {
  useEffect(() => {
    // 1. Never interfere with touch devices (iOS/Android have native 120Hz hardware momentum)
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    // 2. Temporarily set scrollBehavior to auto so window.scrollTo doesn't fight CSS smoothing
    const root = document.documentElement;
    const prevScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isRunning = false;
    let rafId = null;

    // Buttery inertia settings
    const ease = 0.085; // Silky smooth damping coefficient
    const deltaMultiplier = 0.88; // Balanced mouse notch distance

    const onWheel = (e) => {
      // Allow browser zoom, meta keys, and horizontal scrolls
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;

      // Check if mouse is hovering an internal scrollable container (e.g. Chatbot, modal, table)
      const target = e.target;
      if (target && target.closest) {
        const scrollable = target.closest('.overflow-y-auto, .overflow-auto, textarea, select, .max-h-48, .max-h-80, .max-h-96, [data-scrollable]');
        if (scrollable) {
          const delta = e.deltaY;
          const canScrollDown = delta > 0 && scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight - 1;
          const canScrollUp = delta < 0 && scrollable.scrollTop > 1;
          if (canScrollDown || canScrollUp) {
            // Let the inner element handle its own scroll!
            return;
          }
        }
      }

      e.preventDefault();

      // Normalize delta across browsers (Firefox line/page mode vs Chrome/Edge pixel mode)
      let delta = e.deltaY;
      if (e.deltaMode === 1) {
        delta *= 36; // line mode
      } else if (e.deltaMode === 2) {
        delta *= window.innerHeight; // page mode
      }

      const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
      targetY = Math.max(0, Math.min(maxScroll, targetY + delta * deltaMultiplier));

      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(updateScroll);
      }
    };

    const updateScroll = () => {
      const diff = targetY - currentY;
      currentY += diff * ease;

      // Sub-pixel round for ultra-clean rendering
      window.scrollTo(0, Math.round(currentY * 100) / 100);

      if (Math.abs(diff) > 0.3) {
        rafId = requestAnimationFrame(updateScroll);
      } else {
        window.scrollTo(0, targetY);
        currentY = targetY;
        isRunning = false;
      }
    };

    const onNativeScroll = () => {
      // Sync positions if user drags scrollbar thumb or uses keyboard Space / PageDown
      if (!isRunning) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onNativeScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onNativeScroll);
      root.style.scrollBehavior = prevScrollBehavior;
    };
  }, []);
};

export default useSmoothScroll;
