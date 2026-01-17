import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ConfidenceScoreProps {
  score: number;
  threshold?: number;
  animated?: boolean;
  showDetails?: boolean;
}

export const ConfidenceScore: React.FC<ConfidenceScoreProps> = ({
  score,
  threshold = 0.75,
  animated = true,
  showDetails = true,
}) => {
  const percentage = Math.round(score * 100);
  const isApproved = score >= threshold;
  const isFlagged = score >= threshold * 0.8 && score < threshold;

  const getColor = () => {
    if (isApproved) return 'text-green-600';
    if (isFlagged) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = () => {
    if (isApproved) return 'bg-green-100 dark:bg-green-900/20';
    if (isFlagged) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getIcon = () => {
    if (isApproved) return <CheckCircle className="w-8 h-8" />;
    if (isFlagged) return <AlertTriangle className="w-8 h-8" />;
    return <XCircle className="w-8 h-8" />;
  };

  const getStatus = () => {
    if (isApproved) return 'Approved';
    if (isFlagged) return 'Flagged';
    return 'Rejected';
  };

  return (
    <div className={`rounded-2xl p-6 ${getBgColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`${getColor()}`}>
          {getIcon()}
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getColor()}`}>
            {animated ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                {percentage}%
              </motion.span>
            ) : (
              <span>{percentage}%</span>
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Confidence Score
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
            <span className={`text-sm font-semibold ${getColor()}`}>
              {getStatus()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Threshold</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {Math.round(threshold * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Visual progress bar */}
      <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            isApproved
              ? 'bg-green-500'
              : isFlagged
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
