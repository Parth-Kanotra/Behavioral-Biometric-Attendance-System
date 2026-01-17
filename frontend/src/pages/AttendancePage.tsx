import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { ConfidenceScore } from '@/components/ConfidenceScore';
import { behavioralCapture } from '@/utils/behavioralCapture';
// import { behavioralVerifier } from '@/utils/behavioralVerifier';
import { Scan, CheckCircle, XCircle } from 'lucide-react';
import type { BehavioralFeatures, VerificationResult } from '@/types';
import { useNavigate } from 'react-router-dom';

const VERIFICATION_PHRASE = "I am marking my attendance today";
const MIN_INTERACTIONS = 100;  // Increased from 40 to 100
const VERIFICATION_TIME = 20;  // Increased from 15 to 20 seconds

export const AttendancePage: React.FC = () => {
  const [stage, setStage] = useState<'ready' | 'capture' | 'verify' | 'result'>('ready');
  const [inputText, setInputText] = useState('');
  const [interactionCount, setInteractionCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(VERIFICATION_TIME);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (stage === 'capture') {
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

      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleVerify();
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
    setTimeRemaining(VERIFICATION_TIME);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleVerify = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    behavioralCapture.stopCapture();
    setStage('verify');

    try {
      // Check if user typed the phrase
      const typedText = inputText.trim().toLowerCase();
      const expectedText = VERIFICATION_PHRASE.toLowerCase();

      if (typedText !== expectedText) {
        alert(`Please type the exact phrase: "${VERIFICATION_PHRASE}"`);
        setStage('ready');
        setInputText('');
        setInteractionCount(0);
        setTimeRemaining(VERIFICATION_TIME);
        return;
      }

      // Check minimum interactions
      if (interactionCount < MIN_INTERACTIONS) {
        alert(`Not enough interaction data. Required: ${MIN_INTERACTIONS}, Collected: ${interactionCount}. Please try again and type more naturally.`);
        setStage('ready');
        setInputText('');
        setInteractionCount(0);
        setTimeRemaining(VERIFICATION_TIME);
        return;
      }

      // Extract current behavioral features
      const currentFeatures = behavioralCapture.extractFeatures();

      // Get current user from Firebase Auth
      const { auth } = await import('@/config/firebase');
      const user = auth.currentUser;

      if (!user) {
        alert('No authenticated user found. Please login.');
        navigate('/login');
        return;
      }

      console.log('📊 Verifying behavior for user:', user.uid);
      console.log('Current features:', currentFeatures);

      // Call Firebase Cloud Function for verification
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const verifyBiometric = httpsCallable(functions, 'verifyBehavioralBiometric');

      console.log('Calling verifyBehavioralBiometric...');

      const result = await verifyBiometric({
        userId: user.uid,
        currentFeatures: currentFeatures,
        sessionId: null,
      });

      console.log('✅ Verification complete:', result.data);

      const verificationData = result.data as VerificationResult;
      setVerificationResult(verificationData);
      setStage('result');
    } catch (err: any) {
      console.error('❌ Verification failed:', err);

      if (err.code === 'not-found') {
        alert('No enrolled profile found. Please complete enrollment first.');
        navigate('/enroll');
      } else {
        alert(err.message || 'Verification failed. Please try again.');
        setStage('ready');
      }
    }
  };
  
  const resetVerification = () => {
    setStage('ready');
    setInputText('');
    setInteractionCount(0);
    setTimeRemaining(VERIFICATION_TIME);
    setVerificationResult(null);
  };

  const progress = Math.min((interactionCount / MIN_INTERACTIONS) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Mark Attendance
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verify your identity through behavioral biometrics
          </p>
        </div>

        <AnimatePresence mode="wait">
          {stage === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card variant="glass" className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/30">
                    <Scan className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Ready to Mark Attendance?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    This will take approximately 15 seconds
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    What to do:
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Type the verification phrase naturally</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Move your mouse around the screen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Don't try to change your normal typing behavior</span>
                    </li>
                  </ul>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={startCapture}
                  className="w-full"
                >
                  Start Verification
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
                      Capturing...
                    </h2>
                    <motion.div
                      key={timeRemaining}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold text-primary-600"
                    >
                      {timeRemaining}s
                    </motion.div>
                  </div>
                  <ProgressIndicator
                    progress={interactionCount}
                    total={MIN_INTERACTIONS}
                    label="Behavioral Data"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type this phrase:
                  </label>
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                    <p className="text-lg font-mono text-gray-800 dark:text-gray-200">
                      {VERIFICATION_PHRASE}
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

                {progress >= 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleVerify}
                      className="w-full"
                    >
                      Verify Now
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}

          {stage === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glass" className="p-12 text-center">
                <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Verifying Identity...
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Analyzing behavioral patterns with ML algorithms
                </p>
              </Card>
            </motion.div>
          )}

          {stage === 'result' && verificationResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <Card variant="glass" className="p-8">
                <div className="mb-8">
                  <ConfidenceScore
                    score={verificationResult.confidenceScore}
                    animated
                    showDetails
                  />
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Detailed Metrics
                  </h3>
                  
                  {[
                    { label: 'Typing Rhythm', value: verificationResult.similarityMetrics.typingRhythm },
                    { label: 'Key Dynamics', value: verificationResult.similarityMetrics.keyDynamics },
                    { label: 'Mouse Dynamics', value: verificationResult.similarityMetrics.mouseDynamics },
                  ].map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{metric.label}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Math.round(metric.value * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {verificationResult.isMatch ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h4 className="font-bold text-green-900 dark:text-green-100 text-lg">
                        Attendance Marked Successfully
                      </h4>
                    </div>
                    <p className="text-green-800 dark:text-green-200">
                      Your behavioral pattern matches your enrolled profile. Attendance has been recorded.
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <XCircle className="w-6 h-6 text-red-600" />
                      <h4 className="font-bold text-red-900 dark:text-red-100 text-lg">
                        Verification Failed
                      </h4>
                    </div>
                    <p className="text-red-800 dark:text-red-200">
                      Your behavioral pattern doesn't match the enrolled profile. Please try again or contact support.
                    </p>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  onClick={resetVerification}
                  className="w-full"
                >
                  {verificationResult.isMatch ? 'Done' : 'Try Again'}
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
