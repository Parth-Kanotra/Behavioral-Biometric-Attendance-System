import React from 'react';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  progress: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  total,
  label,
  showPercentage = true,
}) => {
  const percentage = Math.min((progress / total) * 100, 100);

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
          {showPercentage && (
            <span className="text-primary-600 dark:text-primary-400 font-semibold">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{progress} captured</span>
        <span>{total} required</span>
      </div>
    </div>
  );
};
