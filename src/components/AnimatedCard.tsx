"use client"

import React, { ReactNode, useState, useRef } from 'react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { Box } from '@mui/material'

export interface AnimatedCardProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
  distance?: number
  threshold?: number
  disableHoverEffects?: boolean
  disableTilt?: boolean
  className?: string
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.6,
  distance = 50,
  threshold = 0.1,
  disableHoverEffects = false,
  disableTilt = false,
  className = '',
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold });
  const [transform, setTransform] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle hover tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableTilt || !cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation based on mouse position
    // Limit tilt to small values (max 5 degrees)
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseLeave = () => {
    setTransform('');
  };

  // Determine initial transform based on animation direction
  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(-${distance}px)`;
      case 'left':
        return `translateX(${distance}px)`;
      case 'right':
        return `translateX(-${distance}px)`;
      default:
        return `translateY(${distance}px)`;
    }
  };

  // Combine refs
  const setRefs = (element: HTMLDivElement) => {
    // @ts-ignore - TypeScript doesn't know about the current property
    ref.current = element;
    cardRef.current = element;
  };

  return (
    <Box
      ref={setRefs}
      onMouseMove={!disableHoverEffects ? handleMouseMove : undefined}
      onMouseLeave={!disableHoverEffects ? handleMouseLeave : undefined}
      className={className}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? transform || 'none' 
          : getInitialTransform(),
        transition: `
          opacity ${duration}s ease-out ${delay}s,
          transform ${duration}s ease-out ${delay}s,
          box-shadow 0.3s ease,
          filter 0.3s ease
        `,
        '&:hover': !disableHoverEffects ? {
          transform: transform || 'translateY(-8px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          filter: 'brightness(1.05)',
        } : {},
        '@keyframes float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        animation: !disableHoverEffects && isVisible ? 'float 6s ease-in-out infinite' : 'none',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </Box>
  );
};

export default AnimatedCard;
