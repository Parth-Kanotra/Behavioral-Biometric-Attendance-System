import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
}) => {
  const variants = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
    glass: 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800/20',
    elevated: 'bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50',
  };

  const Component = hover ? motion.div : 'div';
  const hoverProps = hover
    ? {
        whileHover: { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      className={`rounded-2xl p-6 ${variants[variant]} ${className}`}
      {...hoverProps}
    >
      {children}
    </Component>
  );
};
