"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";

interface AnimatedValueProps {
  value: number;
  formatter?: (value: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
  precision?: number;
  easing?: string[];
}

/**
 * AnimatedValue - Smoothly animates between number values with configurable formatting
 * 
 * @param value - The target number value to display and animate to
 * @param formatter - Function to format the number (e.g., currency formatting)
 * @param duration - Animation duration in seconds
 * @param delay - Delay before animation starts in seconds
 * @param className - Optional CSS class name
 * @param precision - Decimal precision for animation (higher = smoother but more CPU intensive)
 * @param easing - Animation easing function array
 */
export const AnimatedValue = ({
  value,
  formatter = (val: number) => val.toString(),
  duration = 0.5,                // slightly faster by default
  delay = 0,
  className = "",
  precision = 0,
  easing = [0.16, 1, 0.3, 1], // Default to nice, smooth "backOut" easing
}: AnimatedValueProps) => {
  // State to hold the displayed/animated value
  const [displayValue, setDisplayValue] = useState(value);
  
  // Ref to track if this is the first render
  const isFirstRender = useRef(true);
  
  // Previous value ref to animate from
  const prevValueRef = useRef(value);
  // Track current animation controller so we can stop it if a new one starts
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  // Debounce timer id
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup helper
    const stopCurrentAnim = () => {
      if (animRef.current) {
        animRef.current.stop();
        animRef.current = null;
      }
    };

    // Don't animate on first render, just set the value
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    // Skip animation for very small changes to avoid visual noise
    if (Math.abs(value - prevValueRef.current) < 1.0) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    // Debounce: clear any pending update
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      // Stop a running animation to prevent overlap
      stopCurrentAnim();

      // Animate from previous value to new value
      animRef.current = animate(prevValueRef.current, value, {
        duration,
        delay,
        ease: easing,
        onUpdate: (latest) => {
          // Round to precision to avoid excessive decimal places
          if (precision === 0) {
            setDisplayValue(Math.round(latest));
          } else {
            const factor = Math.pow(10, precision);
            setDisplayValue(Math.round(latest * factor) / factor);
          }
        },
        onComplete: () => {
          // Ensure final value is exactly the target value
          setDisplayValue(value);
          prevValueRef.current = value;
          stopCurrentAnim();
        },
      });
    }, 120); // 120 ms debounce

    return () => {
      // Clear debounce timer & stop animation on cleanup
      if (debounceRef.current) clearTimeout(debounceRef.current);
      stopCurrentAnim();
    };
  }, [value, duration, delay, easing, precision]);

  // Format the display value using the provided formatter
  const formattedValue = formatter(displayValue);

  return (
    <span className={className}>
      {formattedValue}
    </span>
  );
};

export default AnimatedValue;
