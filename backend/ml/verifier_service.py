"""
Advanced ML-based behavioral biometric verification service
Designed to run on Google Cloud Run
"""

import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from typing import Dict, List, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

class BehavioralVerifier:
    def __init__(self):
        self.model = None
        self.threshold = 0.75
        self._build_model()
    
    def _build_model(self):
        """Build a simple neural network for behavioral verification"""
        self.model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(20,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        
        self.model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        logger.info("Model built successfully")
    
    def extract_feature_differences(
        self, 
        enrolled: Dict, 
        current: Dict
    ) -> np.ndarray:
        """Extract feature differences for model input"""
        enrolled_sig = np.array(enrolled['signature'])
        current_sig = np.array(current['signature'])
        
        # Feature differences
        differences = np.abs(enrolled_sig - current_sig)
        
        return differences.reshape(1, -1)
    
    def calculate_cosine_similarity(
        self, 
        vec1: np.ndarray, 
        vec2: np.ndarray
    ) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))
    
    def calculate_euclidean_similarity(
        self, 
        vec1: np.ndarray, 
        vec2: np.ndarray
    ) -> float:
        """Calculate normalized Euclidean similarity"""
        distance = np.linalg.norm(vec1 - vec2)
        similarity = 1 / (1 + distance)
        return float(similarity)
    
    def verify(
        self, 
        enrolled_features: Dict, 
        current_features: Dict
    ) -> Dict:
        """
        Verify if current behavior matches enrolled profile
        
        Args:
            enrolled_features: Enrolled behavioral profile
            current_features: Current behavioral sample
        
        Returns:
            Dictionary with verification results
        """
        try:
            enrolled_sig = np.array(enrolled_features['signature'])
            current_sig = np.array(current_features['signature'])
            
            # Calculate multiple similarity metrics
            cosine_sim = self.calculate_cosine_similarity(enrolled_sig, current_sig)
            euclidean_sim = self.calculate_euclidean_similarity(enrolled_sig, current_sig)
            
            # Calculate typing rhythm similarity
            typing_rhythm = self._calculate_typing_rhythm_similarity(
                enrolled_features, 
                current_features
            )
            
            # Calculate key dynamics similarity
            key_dynamics = self._calculate_key_dynamics_similarity(
                enrolled_features,
                current_features
            )
            
            # Calculate mouse dynamics similarity
            mouse_dynamics = self._calculate_mouse_dynamics_similarity(
                enrolled_features,
                current_features
            )
            
            # Weighted overall score
            overall_score = (
                cosine_sim * 0.4 +
                euclidean_sim * 0.2 +
                typing_rhythm * 0.2 +
                key_dynamics * 0.15 +
                mouse_dynamics * 0.05
            )
            
            is_match = overall_score >= self.threshold
            
            return {
                'is_match': bool(is_match),
                'confidence_score': float(overall_score),
                'similarity_metrics': {
                    'cosine': float(cosine_sim),
                    'euclidean': float(euclidean_sim),
                    'typing_rhythm': float(typing_rhythm),
                    'key_dynamics': float(key_dynamics),
                    'mouse_dynamics': float(mouse_dynamics),
                    'overall': float(overall_score)
                },
                'threshold': self.threshold
            }
            
        except Exception as e:
            logger.error(f"Verification error: {str(e)}")
            raise
    
    def _calculate_typing_rhythm_similarity(
        self, 
        enrolled: Dict, 
        current: Dict
    ) -> float:
        """Calculate typing rhythm similarity"""
        enrolled_pattern = np.array(enrolled['rhythmPattern'])
        current_pattern = np.array(current['rhythmPattern'])
        
        # Cosine similarity of rhythm patterns
        rhythm_sim = self.calculate_cosine_similarity(
            enrolled_pattern,
            current_pattern
        )
        
        # Burst typing rate similarity
        burst_diff = abs(enrolled['burstTypingRate'] - current['burstTypingRate'])
        burst_sim = 1 - min(burst_diff, 1)
        
        # Pause frequency similarity
        pause_diff = abs(enrolled['pauseFrequency'] - current['pauseFrequency'])
        pause_sim = 1 - min(pause_diff, 1)
        
        return rhythm_sim * 0.5 + burst_sim * 0.3 + pause_sim * 0.2
    
    def _calculate_key_dynamics_similarity(
        self, 
        enrolled: Dict, 
        current: Dict
    ) -> float:
        """Calculate key dynamics similarity"""
        # Key press duration similarity
        duration_diff = abs(
            enrolled['avgKeyPressDuration'] - current['avgKeyPressDuration']
        )
        max_duration = max(
            enrolled['avgKeyPressDuration'],
            current['avgKeyPressDuration']
        )
        duration_sim = 1 - min(duration_diff / max_duration, 1) if max_duration > 0 else 1
        
        # Inter-key delay similarity
        delay_diff = abs(
            enrolled['avgInterKeyDelay'] - current['avgInterKeyDelay']
        )
        max_delay = max(
            enrolled['avgInterKeyDelay'],
            current['avgInterKeyDelay']
        )
        delay_sim = 1 - min(delay_diff / max_delay, 1) if max_delay > 0 else 1
        
        return (duration_sim + delay_sim) / 2
    
    def _calculate_mouse_dynamics_similarity(
        self, 
        enrolled: Dict, 
        current: Dict
    ) -> float:
        """Calculate mouse dynamics similarity"""
        if not enrolled.get('avgMouseVelocity') or not current.get('avgMouseVelocity'):
            return 0.7  # Neutral score
        
        velocity_diff = abs(
            enrolled['avgMouseVelocity'] - current['avgMouseVelocity']
        )
        max_velocity = max(
            enrolled['avgMouseVelocity'],
            current['avgMouseVelocity']
        )
        
        return 1 - min(velocity_diff / max_velocity, 1) if max_velocity > 0 else 1

# Initialize verifier
verifier = BehavioralVerifier()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model_loaded': verifier.model is not None})

@app.route('/verify', methods=['POST'])
def verify_biometric():
    """
    Verify behavioral biometric
    
    Request body:
    {
        "enrolled_features": {...},
        "current_features": {...}
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'enrolled_features' not in data or 'current_features' not in data:
            return jsonify({'error': 'Invalid request format'}), 400
        
        result = verifier.verify(
            data['enrolled_features'],
            data['current_features']
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Verification endpoint error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/batch-verify', methods=['POST'])
def batch_verify():
    """
    Batch verification for multiple samples
    
    Request body:
    {
        "enrolled_features": {...},
        "samples": [{...}, {...}, ...]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'enrolled_features' not in data or 'samples' not in data:
            return jsonify({'error': 'Invalid request format'}), 400
        
        results = []
        for sample in data['samples']:
            result = verifier.verify(data['enrolled_features'], sample)
            results.append(result)
        
        return jsonify({'results': results})
        
    except Exception as e:
        logger.error(f"Batch verification error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on port 8080 for Cloud Run
    app.run(host='0.0.0.0', port=8080, debug=False)
