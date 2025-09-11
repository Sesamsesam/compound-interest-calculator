/**
 * Smooth scroll utility for scrolling to elements or positions
 */

// Types for scroll options
export interface SmoothScrollOptions {
  /** Duration of the scroll animation in milliseconds */
  duration?: number;
  /** Easing function to use for the animation */
  easing?: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic';
  /** Offset from the target position in pixels */
  offset?: number;
  /** Callback function to execute when scrolling is complete */
  onComplete?: () => void;
}

// Collection of easing functions
const easingFunctions = {
  // No easing, linear animation
  linear: (t: number): number => t,
  
  // Quadratic easing functions
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  // Cubic easing functions
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

/**
 * Smoothly scrolls to an element or position on the page
 * @param target Element or position to scroll to
 * @param options Scroll animation options
 */
export const smoothScroll = (
  target: HTMLElement | number | string,
  options: SmoothScrollOptions = {}
): void => {
  const {
    duration = 800,
    easing = 'easeOutCubic',
    offset = 0,
    onComplete,
  } = options;

  // Get the target position
  let targetPosition: number;

  if (typeof target === 'number') {
    // If target is a number, use it directly
    targetPosition = target;
  } else if (typeof target === 'string') {
    // If target is a string, treat it as a selector
    const element = document.querySelector(target);
    if (!element) {
      console.error(`Element with selector "${target}" not found.`);
      return;
    }
    targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
  } else {
    // If target is an element
    targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
  }

  // Apply offset
  targetPosition += offset;

  // Get the start position
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  
  // Return if there's no distance to scroll
  if (distance === 0) {
    if (onComplete) onComplete();
    return;
  }

  // Get the easing function
  const easingFunction = easingFunctions[easing];

  // Variables for the animation
  let startTime: number | null = null;

  // Animation function
  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easedProgress = easingFunction(progress);
    
    window.scrollTo(0, startPosition + distance * easedProgress);
    
    // Continue the animation if not complete
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      // Ensure we end at exactly the right position
      window.scrollTo(0, targetPosition);
      if (onComplete) onComplete();
    }
  }

  // Start the animation
  requestAnimationFrame(animation);
};

/**
 * Smoothly scrolls to an element with a specific ID
 * @param id ID of the element to scroll to
 * @param options Scroll animation options
 */
export const scrollToId = (id: string, options: SmoothScrollOptions = {}): void => {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Element with ID "${id}" not found.`);
    return;
  }
  
  smoothScroll(element, options);
};

/**
 * Smoothly scrolls to the next section from current position
 * @param options Scroll animation options
 */
export const scrollToNextSection = (options: SmoothScrollOptions = {}): void => {
  const sections = Array.from(document.querySelectorAll('section'));
  const currentPosition = window.pageYOffset;
  
  // Find the next section
  const nextSection = sections.find(section => {
    const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
    return sectionTop > currentPosition + 50; // Add small threshold
  });
  
  if (nextSection) {
    smoothScroll(nextSection, options);
  }
};

export default smoothScroll;
