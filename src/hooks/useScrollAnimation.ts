import { useRef, useState, useEffect } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Custom hook that uses Intersection Observer to detect when elements come into view.
 * Implements an unfold/fold behavior where:
 * - When scrolling DOWN: Elements appear when they come into view and stay visible
 * - When scrolling UP: Only elements leaving the BOTTOM of the viewport disappear
 * 
 * @param options Configuration options for the Intersection Observer
 * @param options.threshold The percentage of the target element that needs to be visible
 * @param options.rootMargin Margin around the root element
 * @param options.triggerOnce Whether to trigger the animation only once
 * @returns An object containing the ref to attach to the element and a boolean indicating if the element is visible
 */
export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { 
    /* Trigger even earlier: element only needs 10% visibility */
    threshold = 0.10,
    /* Larger negative top margin so the trigger fires much sooner
       (≈ 20 px before the element reaches the viewport) */
    rootMargin = '-20px 0px',
    // By default run every time the element enters / leaves the viewport
    triggerOnce = false
  } = options;
  
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  // Track scroll direction
  const prevScrollY = useRef<number>(typeof window !== 'undefined' ? window.scrollY : 0);
  const [scrollingDown, setScrollingDown] = useState<boolean>(true);
  // Track element position relative to viewport
  const elementPositionRef = useRef<{ top: number; bottom: number } | null>(null);

  // Update scroll direction when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const newScrollingDown = currentScrollY > prevScrollY.current;
      setScrollingDown(newScrollingDown);
      prevScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Store element position relative to viewport
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          elementPositionRef.current = { top: rect.top, bottom: rect.bottom };
        }

        if (entry.isIntersecting) {
          // When element comes into view while scrolling down, make it visible
          if (scrollingDown) {
            setIsVisible(true);
          } else {
            /* ------------------------------------------------------------------
             * Special-case for the very first card:
             * When the user has scrolled all the way back to the top (scrollY <= 0)
             * we want the upper-most card to disappear, so the page looks folded-up.
             * Only the element currently intersecting the viewport (the top card)
             * will satisfy this condition, so lower cards remain untouched.
             * -----------------------------------------------------------------*/
            if (typeof window !== 'undefined' && window.scrollY <= 0) {
              setIsVisible(false);
            }
          }
          // If triggerOnce is true, disconnect the observer after element becomes visible
          if (triggerOnce && scrollingDown) {
            observer.disconnect();
          }
        } else {
          // When element is completely out of the viewport
          if (!scrollingDown && !triggerOnce && entry.intersectionRatio === 0) {
            // Check if element is below the viewport
            const viewportHeight = window.innerHeight;
            const elementBottom = elementPositionRef.current?.bottom || 0;
            
            // Only hide if element is completely below the viewport
            if (elementBottom > viewportHeight) {
              setIsVisible(false);
            }
          }
          // When scrolling down, keep elements visible even when they leave the viewport
        }
      },
      { threshold, rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Cleanup observer on unmount
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, triggerOnce, scrollingDown]);

  return { ref, isVisible, scrollingDown };
};

export default useScrollAnimation;
