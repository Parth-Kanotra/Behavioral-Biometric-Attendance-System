# 🔐 BBAS - Behavioral Biometric Attendance System

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.x-orange.svg)](https://firebase.google.com/)

Secure, fraud-proof attendance verification using behavioral biometrics and typing dynamics. BBAS eliminates proxy attendance by analyzing unique behavioral patterns that are impossible to replicate.

---

##  Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [How It Works](#-how-it-works)
- [Installation](#️-installation--setup)
- [Project Structure](#-project-structure)
- [Future Enhancements](#-future-enhancements)
- [Current Limitations](#-current-limitations)
- [Author](#-author)

---

##  Overview

BBAS (Behavioral Biometric Attendance System) uses **behavioral biometrics** to verify student identity through unique patterns like typing rhythm, keystroke dynamics, and mouse movements. These traits are as unique as fingerprints but **impossible to share or replicate** - eliminating proxy attendance.

### The Problem

Traditional attendance systems face critical challenges:
- ❌ **Proxy Attendance**: Students marking attendance for absent friends
- ❌ **Identity Fraud**: Shared credentials and passwords
- ❌ **No Verification**: Systems can't verify actual identity

### Our Solution

BBAS uses advanced machine learning algorithms to create a unique 128-dimensional behavioral signature for each user. During attendance verification, the system compares current behavior against the enrolled profile with **85% accuracy threshold**, ensuring only the actual user can mark attendance.

---
##  Features

### For Students
- **Quick Enrollment** - 30-second process capturing 150+ data points
- **Real-time Verification** - Instant feedback with confidence scores
- **Attendance History** - View records and scores
- **Privacy Protected** - Only patterns stored, not keystrokes

### For Faculty
- **Analytics Dashboard** - Real-time charts and trends
- **Score Distribution** - Visual confidence metrics
- **CSV Export** - Download for analysis
- **Flagged Records** - Auto-flagged low-confidence attempts

### Security
- **85% Threshold** - High confidence required
- **Once Per Day** - Prevents multiple attempts
- **Encrypted Storage** - Firebase encryption
- **Role-Based Access** - Granular permissions
---

##  Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Interactive data visualization
- **Lucide React** - Beautiful icon library

### Backend
- **Firebase Cloud Functions** - Serverless compute (Node.js 18)
- **Cloud Firestore** - NoSQL real-time database
- **Firebase Authentication** - Email/password authentication
- **Firebase Hosting** - Static site hosting
- **Firebase Emulators** - Local development environment

### Machine Learning & Algorithms
- **Custom Behavioral Analysis** - Proprietary algorithms for pattern matching
- **Cosine Similarity** - Vector comparison (40% weight)
- **Typing Rhythm Analysis** - Temporal pattern recognition (30% weight)
- **Key Dynamics** - Keystroke timing comparison (20% weight)
- **Mouse Dynamics** - Movement pattern analysis (10% weight)

---

##  How It Works

### 1. Enrollment Phase

Student types a phrase naturally over 30 seconds while the system captures **150+ behavioral data points** including typing rhythm, key press duration, inter-key delays, and mouse dynamics. Machine learning algorithms process this data to create a unique **128-dimensional signature vector** stored securely in Firestore.

### 2. Verification Phase

During attendance, the student types a verification phrase. The system compares current behavior with the enrolled profile using **4 weighted algorithms**:

- **Cosine Similarity (40%)** - Compares signature vectors for overall pattern matching
- **Typing Rhythm Analysis (30%)** - Analyzes burst rate, pause frequency, and temporal patterns
- **Key Dynamics Comparison (20%)** - Measures press duration, inter-key delays, and backspace rate
- **Mouse Movement Analysis (10%)** - Evaluates velocity profiles and acceleration patterns

The system calculates a **weighted confidence score**. If score **≥85%**, attendance is approved ✅. If **<85%**, it's rejected ❌.

### 3. Analytics & Reporting

Attendance records are saved to Firestore with timestamps, confidence scores, and behavioral metrics. Faculty can view real-time analytics through interactive charts and export data to CSV for further analysis.

---
##  Getting Started
###  Prerequisites

Before installing BBAS, ensure you have:

- **[Node.js](https://nodejs.org/)** ( Version 18 or higher ) 
- **[npm](https://www.npmjs.com/)** ( Version 9 or higher )
- **[Git](https://git-scm.com/)**
- **Firebase Account** (free Spark plan is sufficient)

###  Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Parth-Kanotra/BBAS-Attendance-System.git
cd BBAS-Attendance-System
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend/functions
npm install
```

### 4. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable **Email/Password**
4. Enable **Cloud Firestore**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in **production mode**
   - Choose location (us-central1 recommended)
5. Enable **Cloud Functions**:
   - Go to Functions
   - Upgrade to Blaze plan (pay-as-you-go) OR use emulators for local dev
6. Get your Firebase configuration:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Add web app
   - Copy the configuration object

### 5. Configure Environment Variables

Create `frontend/.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important:** Never commit `.env` files to Git! They're already in `.gitignore`.

### 6. Initialize Firebase (if not done)

```bash
cd backend
firebase login
firebase init

# Select:
# - Functions (Configure Cloud Functions)
# - Firestore (Configure Firestore rules)
# - Emulators (Set up local emulators)

# Choose options:
# - Language: TypeScript
# - Use ESLint: Yes
# - Install dependencies: Yes
```

### 7. Build Backend Functions

```bash
cd backend/functions
npm run build
```

### 8. Start Development Servers

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

**Terminal 2 - Firebase Emulators:**
```bash
cd backend
firebase emulators:start
```
Emulators run at:
- Auth: `http://localhost:9099`
- Firestore: `http://localhost:8090`
- Functions: `http://localhost:5001`
- Emulator UI: `http://localhost:4000`

### 9. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the BBAS login page! 🎉

---

##  Project Structure

```
📂BBAS
├── 📂frontend                      # React frontend application
│   ├── 📂public                    # Static assets
│   ├── 📂src
│   │   ├── 📂components            # Reusable UI components
│   │   ├── 📂pages                 # Main application pages
│   │   ├── 📂utils                 # Utility functions
│   │   ├── 📂config                # Configuration files
│   │   │   └── firebase.ts       # Firebase initialization
│   │   ├── App.tsx               # Main app component
│   │   └── main.tsx              # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── 📂backend                       # Firebase backend
│   ├── 📂functions                 # Cloud Functions
│   │   ├── 📂src
│   │   │   └── index.ts          # Function definitions
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── firebase.json              # Firebase configuration
│   ├── firestore.rules            # Firestore security rules
│   └── firestore.indexes.json     # Firestore indexes
│
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

---

##  Current Limitations

- **Internet Required** - Needs stable connection for real-time verification
- **Desktop Optimized** - Best on laptop/desktop keyboards (mobile keyboards have different dynamics)
- **Emulator Only** - Production deployment requires Firebase Blaze plan
- **Re-enrollment Needed** - If typing style changes significantly
- **Single Phrase** - Currently uses one fixed phrase

---


##  Future Enhancements

We have an exciting roadmap for BBAS:

### Phase 1 (Coming Soon)
- **Webcam Facial Recognition Integration** - Add dual-factor authentication combining behavior + biometrics
- **Multi-Session Enrollment** - Capture behavior across 3+ sessions for improved accuracy
- **Mobile Application** - Native iOS and Android apps with touch dynamics analysis
---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---
## 👤 Author

**Parth Kanotra**

- GitHub: [@Parth-Kanotra](https://github.com/Parth-Kanotra)
- Email: kanotraparth28@gmail.com

---

<div align="center">

**Built with using React, TypeScript, and Firebase**

**BBAS - Your Behavior is Your Signature**

*Secure • Unique • Unforgeable*

---

[⬆ Back to Top](#-bbas---behavioral-biometric-attendance-system)

</div>
