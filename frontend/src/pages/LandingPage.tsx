import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Fingerprint, Shield, Zap, Lock, Users, TrendingUp } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // const features = [
  //   {
  //     icon: <Fingerprint className="w-6 h-6" />,
  //     title: 'Behavioral Biometrics',
  //     description: 'Verify users based on unique typing patterns and interaction behavior',
  //   },
  //   {
  //     icon: <Shield className="w-6 h-6" />,
  //     title: 'Anti-Proxy Protection',
  //     description: 'Prevent proxy attendance with continuous behavioral verification',
  //   },
  //   {
  //     icon: <Zap className="w-6 h-6" />,
  //     title: 'Real-time Analysis',
  //     description: 'Instant verification using machine learning algorithms',
  //   },
  //   {
  //     icon: <Lock className="w-6 h-6" />,
  //     title: 'Privacy First',
  //     description: 'No personal data stored, only behavioral features',
  //   },
  //   {
  //     icon: <Users className="w-6 h-6" />,
  //     title: 'Easy Enrollment',
  //     description: 'Simple 15-second enrollment process for all users',
  //   },
  //   {
  //     icon: <TrendingUp className="w-6 h-6" />,
  //     title: 'Analytics Dashboard',
  //     description: 'Comprehensive insights for faculty and administrators',
  //   },
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/30">
              <Fingerprint className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 bg-clip-text text-transparent leading-tight">
            Behavioral Biometric
            <br />
            Attendance System
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Revolutionary attendance verification using behavioral biometrics.
            <br />
            Prevent proxy attendance with invisible, continuous authentication.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Demo Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <Card variant="glass" className="p-8">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />
              <div className="relative z-10 text-center">
                <Fingerprint className="w-24 h-24 text-primary-500 mx-auto mb-4 animate-pulse-slow" />
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Live Behavioral Analysis
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Features Section */}
      {/*
      <div className="bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose BBAS?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              State-of-the-art technology that combines security with ease of use
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card variant="elevated" hover className="h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      */}
      {/* How It Works Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three simple steps to secure attendance verification
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                step: '01',
                title: 'Enroll Your Behavior',
                description: 'Complete a simple 15-second typing and interaction task to create your unique behavioral profile.',
              },
              {
                step: '02',
                title: 'Mark Attendance',
                description: 'Interact naturally with the system for 10-15 seconds during attendance sessions.',
              },
              {
                step: '03',
                title: 'Instant Verification',
                description: 'ML algorithms verify your identity in real-time based on your behavioral patterns.',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <Card variant="glass" className="flex flex-col md:flex-row items-center gap-6">
                  <div className="text-6xl font-bold text-transparent bg-gradient-to-br from-primary-500 to-accent-500 bg-clip-text">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Attendance?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join the future of secure, proxy-proof attendance verification
            </p>
            <div className="flex justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-white text-primary-700 hover:bg-gray-100"
              >
                Get Started Now
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
