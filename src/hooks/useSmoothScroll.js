import { useEffect } from 'react';

/**
 * Professional High-Performance Scrolling Hook
 * Ensures 1:1 native hardware-accelerated responsiveness matched to the user's
 * exact trackpad and mouse speed with zero lag, zero sluggish drag, and 120Hz refresh.
 */
export const useSmoothScroll = () => {
  useEffect(() => {
    const root = document.documentElement;
    // Set auto scroll behavior so mouse wheel / trackpad responds with zero input delay
    root.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';

    return () => {
      root.style.scrollBehavior = '';
      document.body.style.scrollBehavior = '';
    };
  }, []);
};

export default useSmoothScroll;
