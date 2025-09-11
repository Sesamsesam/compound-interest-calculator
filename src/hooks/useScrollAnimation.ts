import { useRef, useState, useEffect } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Custom hook that uses Intersection Observer to detect when elements come into view.
 * @param options Configuration options for the Intersection Observer
 * @param options.threshold The percentage of the target element that needs to be visible
 * @param options.rootMargin Margin around the root element
 * @param options.triggerOnce Whether to trigger the animation only once
 * @returns An object containing the ref to attach to the element and a boolean indicating if the element is visible
 */
export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { 
    /* Trigger a bit earlier: element only needs ~30 % visibility             */
    threshold = 0.3,
    /* Negative top margin makes the trigger fire before the element
       actually reaches the viewport (-50 px sooner)                         */
    rootMargin = '-50px 0px',
    // By default run every time the element enters / leaves the viewport
    triggerOnce = false
  } = options;
  
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update visibility state based on intersection
        if (entry.isIntersecting) {
          setIsVisible(true);
          // If triggerOnce is true, disconnect the observer after element becomes visible
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
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
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

export default useScrollAnimation;
