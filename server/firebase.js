import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK with environment variables
const firebaseConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
};

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp(firebaseConfig);
  console.log('Firebase Admin SDK Initialized.');
} else {
  console.log('Firebase Admin SDK already initialized.');
}

// Get Firestore database instance
const db = getFirestore();

// Get Firebase Storage instance
const storage = getStorage();

// Get Firebase Auth instance
const auth = getAuth();

export { db, storage, auth, admin };