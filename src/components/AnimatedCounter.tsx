"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Box, Typography, TypographyProps } from '@mui/material';

interface AnimatedCounterProps extends Omit<TypographyProps, 'children'> {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
  threshold?: number;
  decimalPlaces?: number;
  useEasing?: boolean;
  className?: string;
  gradientText?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  /* Twice as fast default duration */
  duration = 1000,
  delay = 0,
  prefix = '',
  suffix = '',
  formatter,
  threshold = 0.1,
  decimalPlaces = 0,
  useEasing = true,
  className = '',
  gradientText = false,
  ...typographyProps
}) => {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollAnimation({ threshold });
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  // Format the number based on props
  const formatNumber = (num: number): string => {
    if (formatter) {
      return formatter(num);
    }
    
    // Format with specified decimal places
    const formattedNum = num.toFixed(decimalPlaces);
    
    // Add thousand separators
    return formattedNum.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Reset animation when value changes
  useEffect(() => {
    if (isVisible) {
      startTimeRef.current = null;
      setCount(0);
    }
  }, [value, isVisible]);

  // Animation effect
  useEffect(() => {
    if (!isVisible) return;

    // Delay the animation start if needed
    const delayTimeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }
        
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Apply easing function for smoother animation
        let easedProgress = progress;
        if (useEasing) {
          // easeOutExpo function for natural counting feel
          easedProgress = progress === 1 
            ? 1 
            : 1 - Math.pow(2, -10 * progress);
        }
        
        const currentCount = easedProgress * value;
        setCount(currentCount);
        
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setCount(value); // Ensure we end exactly at the target value
        }
      };
      
      frameRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
      };
    }, delay);
    
    return () => clearTimeout(delayTimeout);
  }, [isVisible, value, duration, delay, useEasing]);

  // Gradient text styles
  const gradientStyles = gradientText ? {
    /* Yellow → Green gradient */
    background: 'linear-gradient(90deg, #f5d020, #3df55a)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'gradient-shift 4s ease infinite',
    '@keyframes gradient-shift': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' }
    },
    backgroundSize: '200% auto',
  } : {};

  return (
    <Box ref={ref} className={className}>
      <Typography {...typographyProps} sx={{ ...typographyProps.sx, ...gradientStyles }}>
        {prefix}{formatNumber(count)}{suffix}
      </Typography>
    </Box>
  );
};

export default AnimatedCounter;
