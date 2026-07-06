import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountString) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not set in the environment variables.");
}
const serviceAccount = JSON.parse(serviceAccountString!);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = getFirestore(admin.app());