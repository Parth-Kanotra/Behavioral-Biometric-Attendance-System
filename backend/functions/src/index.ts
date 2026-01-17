import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

interface BehavioralFeatures {
    avgKeyPressDuration: number;
    avgInterKeyDelay: number;
    keyPressVariance: number;
    interKeyVariance: number;
    rhythmPattern: number[];
    burstTypingRate: number;
    pauseFrequency: number;
    backspaceRate: number;
    correctionTiming: number[];
    avgMouseVelocity?: number;
    mouseAcceleration?: number;
    signature: number[];
}

// interface VerificationRequest {
//     userId: string;
//     currentFeatures: BehavioralFeatures;
//     sessionId?: string;
// }

interface VerificationResult {
    isMatch: boolean;
    confidenceScore: number;
    similarityMetrics: {
        typingRhythm: number;
        keyDynamics: number;
        mouseDynamics: number;
        overall: number;
    };
    timestamp: Date;
}

export const enrollBehavioralProfile = functions.https.onCall(
    async (data, context) => {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated to enroll'
            );
        }

        const userId = data.userId;
        const features = data.features;

        // Verify user is enrolling their own profile
        if (context.auth.uid !== userId) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'Cannot enroll profile for another user'
            );
        }

        try {
            functions.logger.info('Starting enrollment for user:', userId);
            functions.logger.info('Features received:', JSON.stringify(features));

            // Save behavioral profile to Firestore
            const profileData = {
                avgKeyPressDuration: features.avgKeyPressDuration || 0,
                avgInterKeyDelay: features.avgInterKeyDelay || 0,
                keyPressVariance: features.keyPressVariance || 0,
                interKeyVariance: features.interKeyVariance || 0,
                rhythmPattern: features.rhythmPattern || [],
                burstTypingRate: features.burstTypingRate || 0,
                pauseFrequency: features.pauseFrequency || 0,
                backspaceRate: features.backspaceRate || 0,
                correctionTiming: features.correctionTiming || [],
                avgMouseVelocity: features.avgMouseVelocity || 0,
                mouseAcceleration: features.mouseAcceleration || 0,
                signature: features.signature || [],
                enrolledAt: new Date().toISOString(),
                sampleCount: 1,
                userId: userId,
            };

            await db.collection('behavioral_profiles').doc(userId).set(profileData);

            functions.logger.info('✅ Profile enrolled successfully for user:', userId);

            return {
                success: true,
                message: 'Behavioral profile enrolled successfully'
            };
        } catch (error: any) {
            functions.logger.error('❌ Enrollment error:', error);
            functions.logger.error('Error details:', error.message, error.stack);
            throw new functions.https.HttpsError(
                'internal',
                'Failed to save behavioral profile: ' + error.message
            );
        }
    }
);

export const verifyBehavioralBiometric = functions.https.onCall(
    async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated to verify attendance'
            );
        }

        const userId = data.userId;
        const currentFeatures = data.currentFeatures as BehavioralFeatures;
        const sessionId = data.sessionId;

        if (context.auth.uid !== userId) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'Cannot verify attendance for another user'
            );
        }

        try {
            functions.logger.info('Starting verification for user:', userId);

            const profileDoc = await db
                .collection('behavioral_profiles')
                .doc(userId)
                .get();

            if (!profileDoc.exists) {
                throw new functions.https.HttpsError(
                    'not-found',
                    'Behavioral profile not found. Please complete enrollment first.'
                );
            }

            const enrolledFeatures = profileDoc.data() as BehavioralFeatures;
            functions.logger.info('Enrolled features found');

            const result = calculateSimilarity(enrolledFeatures, currentFeatures);

            functions.logger.info('Similarity calculated:', result.confidenceScore);

            // Get user info
            const userDoc = await db.collection('users').doc(userId).get();
            const userData = userDoc.data();

            // Save attendance record
            const attendanceRecord = {
                userId: userId,
                studentName: userData?.displayName || context.auth.token.name || 'Unknown',
                studentEmail: userData?.email || context.auth.token.email || '',
                timestamp: new Date().toISOString(),
                confidenceScore: result.confidenceScore,
                status: result.isMatch ? 'approved' : 'rejected',
                sessionId: sessionId || null,
                features: currentFeatures,
                similarityMetrics: result.similarityMetrics,
            };

            await db.collection('attendance_records').add(attendanceRecord);

            functions.logger.info(
                `✅ Attendance verified for user: ${userId}, Score: ${result.confidenceScore}, Status: ${result.isMatch ? 'approved' : 'rejected'}`
            );

            return result;
        } catch (error: any) {
            functions.logger.error('❌ Verification error:', error);
            functions.logger.error('Error details:', error.message, error.stack);

            if (error instanceof functions.https.HttpsError) {
                throw error;
            }

            throw new functions.https.HttpsError(
                'internal',
                'Failed to verify behavioral biometric: ' + error.message
            );
        }
    }
);

export const getAttendanceAnalytics = functions.https.onCall(
    async (data: { facultyId: string; courseId?: string; limit?: number }, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated'
            );
        }

        try {
            const userDoc = await db.collection('users').doc(context.auth.uid).get();
            const userData = userDoc.data();

            if (!userData || userData.role !== 'faculty') {
                throw new functions.https.HttpsError(
                    'permission-denied',
                    'Only faculty members can access attendance analytics'
                );
            }

            const { courseId, limit = 100 } = data;

            let query = db
                .collection('attendance_records')
                .orderBy('timestamp', 'desc')
                .limit(limit);

            if (courseId) {
                query = query.where('courseId', '==', courseId) as any;
            }

            const snapshot = await query.get();

            const records = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            functions.logger.info(
                `Analytics retrieved: ${records.length} records`
            );

            return { records };
        } catch (error) {
            functions.logger.error('Analytics error:', error);

            if (error instanceof functions.https.HttpsError) {
                throw error;
            }

            throw new functions.https.HttpsError(
                'internal',
                'Failed to fetch attendance analytics'
            );
        }
    }
);

function calculateSimilarity(
    enrolled: BehavioralFeatures,
    current: BehavioralFeatures
): VerificationResult {
    const typingRhythm = calculateTypingRhythmSimilarity(enrolled, current);
    const keyDynamics = calculateKeyDynamicsSimilarity(enrolled, current);
    const mouseDynamics = calculateMouseDynamicsSimilarity(enrolled, current);
    const overall = cosineSimilarity(enrolled.signature, current.signature);

    const confidenceScore = overall;
    const THRESHOLD = 0.75;
    const isMatch = confidenceScore >= THRESHOLD;

    return {
        isMatch,
        confidenceScore,
        similarityMetrics: {
            typingRhythm,
            keyDynamics,
            mouseDynamics,
            overall,
        },
        timestamp: new Date(),
    };
}

function calculateTypingRhythmSimilarity(
    enrolled: BehavioralFeatures,
    current: BehavioralFeatures
): number {
    const rhythmSimilarity = cosineSimilarity(
        enrolled.rhythmPattern,
        current.rhythmPattern
    );

    const burstDiff = Math.abs(enrolled.burstTypingRate - current.burstTypingRate);
    const burstSimilarity = 1 - Math.min(burstDiff, 1);

    const pauseDiff = Math.abs(enrolled.pauseFrequency - current.pauseFrequency);
    const pauseSimilarity = 1 - Math.min(pauseDiff, 1);

    return rhythmSimilarity * 0.5 + burstSimilarity * 0.3 + pauseSimilarity * 0.2;
}

function calculateKeyDynamicsSimilarity(
    enrolled: BehavioralFeatures,
    current: BehavioralFeatures
): number {
    const durationDiff = Math.abs(
        enrolled.avgKeyPressDuration - current.avgKeyPressDuration
    );
    const maxDuration = Math.max(
        enrolled.avgKeyPressDuration,
        current.avgKeyPressDuration
    );
    const durationSimilarity = maxDuration > 0
        ? 1 - Math.min(durationDiff / maxDuration, 1)
        : 1;

    const delayDiff = Math.abs(
        enrolled.avgInterKeyDelay - current.avgInterKeyDelay
    );
    const maxDelay = Math.max(
        enrolled.avgInterKeyDelay,
        current.avgInterKeyDelay
    );
    const delaySimilarity = maxDelay > 0
        ? 1 - Math.min(delayDiff / maxDelay, 1)
        : 1;

    const varianceDiff = Math.abs(
        enrolled.keyPressVariance - current.keyPressVariance
    );
    const maxVariance = Math.max(
        enrolled.keyPressVariance,
        current.keyPressVariance
    );
    const varianceSimilarity = maxVariance > 0
        ? 1 - Math.min(varianceDiff / maxVariance, 1)
        : 1;

    const backspaceDiff = Math.abs(
        enrolled.backspaceRate - current.backspaceRate
    );
    const backspaceSimilarity = 1 - Math.min(backspaceDiff, 1);

    return (
        durationSimilarity * 0.3 +
        delaySimilarity * 0.3 +
        varianceSimilarity * 0.2 +
        backspaceSimilarity * 0.2
    );
}

function calculateMouseDynamicsSimilarity(
    enrolled: BehavioralFeatures,
    current: BehavioralFeatures
): number {
    if (!enrolled.avgMouseVelocity || !current.avgMouseVelocity) {
        return 0.7;
    }

    const velocityDiff = Math.abs(
        enrolled.avgMouseVelocity - current.avgMouseVelocity
    );
    const maxVelocity = Math.max(
        enrolled.avgMouseVelocity,
        current.avgMouseVelocity
    );
    const velocitySimilarity = maxVelocity > 0
        ? 1 - Math.min(velocityDiff / maxVelocity, 1)
        : 1;

    const accelDiff = Math.abs(
        (enrolled.mouseAcceleration || 0) - (current.mouseAcceleration || 0)
    );
    const maxAccel = Math.max(
        enrolled.mouseAcceleration || 0,
        current.mouseAcceleration || 0
    );
    const accelSimilarity = maxAccel > 0
        ? 1 - Math.min(accelDiff / maxAccel, 1)
        : 1;

    return velocitySimilarity * 0.6 + accelSimilarity * 0.4;
}

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
}