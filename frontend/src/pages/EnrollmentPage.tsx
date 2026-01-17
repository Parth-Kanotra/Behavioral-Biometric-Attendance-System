import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { behavioralCapture } from '@/utils/behavioralCapture';
import { CheckCircle, Keyboard, Mouse, AlertCircle } from 'lucide-react';

const ENROLLMENT_PHRASE = "The quick brown fox jumps over the lazy dog";
const MIN_INTERACTIONS = 50;
const ENROLLMENT_TIME = 20; // seconds

export const EnrollmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'intro' | 'capture' | 'processing' | 'complete'>('intro');
  const [inputText, setInputText] = useState('');
  const [interactionCount, setInteractionCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(ENROLLMENT_TIME);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (stage === 'capture') {
      // Add event listeners
      const handleKeyDown = (e: KeyboardEvent) => {
        behavioralCapture.handleKeyDown(e);
        setInteractionCount(behavioralCapture.getInteractionCount());
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        behavioralCapture.handleKeyUp(e);
        setInteractionCount(behavioralCapture.getInteractionCount());
      };

      const handleMouseMove = (e: MouseEvent) => {
        behavioralCapture.handleMouseMove(e);
        setInteractionCount(behavioralCapture.getInteractionCount());
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
      document.addEventListener('mousemove', handleMouseMove);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        document.removeEventListener('mousemove', handleMouseMove);
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [stage]);

  const startCapture = () => {
    setStage('capture');
    behavioralCapture.startCapture();
    setInputText('');
    setInteractionCount(0);
    setTimeRemaining(ENROLLMENT_TIME);
    setError(null);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleComplete = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    behavioralCapture.stopCapture();

    if (interactionCount < MIN_INTERACTIONS) {
      setError(`Need at least ${MIN_INTERACTIONS} interactions. You provided ${interactionCount}.`);
      setStage('intro');
      return;
    }

    setStage('processing');

    try {
      // Extract behavioral features
      const features = behavioralCapture.extractFeatures();

      console.log('Behavioral Features:', features);

      // Get current user from Firebase Auth
      const { auth } = await import('@/config/firebase');
      const user = auth.currentUser;

      if (!user) {
        throw new Error('No authenticated user found');
      }

      console.log('Calling enrollBehavioralProfile for user:', user.uid);

      // Save to Firebase using Cloud Function
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const enrollProfile = httpsCallable(functions, 'enrollBehavioralProfile');

      const result = await enrollProfile({
        userId: user.uid,
        features: features,
      });

      console.log('✅ Enrollment result:', result);

      setStage('complete');

      // Redirect to attendance after 3 seconds
      setTimeout(() => {
        navigate('/attendance');
      }, 3000);
    } catch (err: any) {
      console.error('❌ Enrollment error:', err);
      setError(err.message || 'Failed to process enrollment. Please try again.');
      setStage('intro');
    }
  };

  const progress = Math.min((interactionCount / MIN_INTERACTIONS) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card variant="glass" className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/30">
                    <Keyboard className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    Behavioral Enrollment
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Create your unique behavioral signature in just 20 seconds
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Type the Phrase
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Type the phrase naturally as you normally would
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Move Your Mouse
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Move your mouse naturally around the screen
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Complete in 20 Seconds
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        The system will capture your behavioral patterns
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Privacy Notice
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    We only store behavioral patterns (timing, rhythm, dynamics) - NOT what you type.
                    Your privacy is our priority.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={startCapture}
                  className="w-full"
                >
                  Start Enrollment
                </Button>
              </Card>
            </motion.div>
          )}

          {stage === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glass" className="p-8">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Capturing Behavior...
                    </h2>
                    <div className="text-3xl font-bold text-primary-600">
                      {timeRemaining}s
                    </div>
                  </div>
                  <ProgressIndicator
                    progress={interactionCount}
                    total={MIN_INTERACTIONS}
                    label="Interactions Captured"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type this phrase:
                  </label>
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                    <p className="text-lg font-mono text-gray-800 dark:text-gray-200">
                      {ENROLLMENT_PHRASE}
                    </p>
                  </div>
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full h-32 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:bg-gray-800 dark:text-white resize-none"
                    placeholder="Start typing here..."
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-center gap-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-primary-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {behavioralCapture.getKeyEventCount()} keystrokes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mouse className="w-5 h-5 text-accent-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mouse tracking active
                    </span>
                  </div>
                </div>

                {progress >= 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleComplete}
                      className="w-full"
                    >
                      Complete Enrollment
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}

          {stage === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glass" className="p-12 text-center">
                <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Processing Your Behavioral Profile
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Analyzing {interactionCount} behavioral data points...
                </p>
              </Card>
            </motion.div>
          )}

          {stage === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <Card variant="glass" className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/50"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Enrollment Complete!
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Your behavioral profile has been created successfully
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Redirecting to dashboard...
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
