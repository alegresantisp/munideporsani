import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

declare global {
  // eslint-disable-next-line no-var
  var _firebaseAdminAppInitialized: boolean | undefined;
}

if (!global._firebaseAdminAppInitialized && !getApps().length) {
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // La private key suele venir con saltos de línea escapados, por eso el replace.
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  initializeApp({
    credential: cert(serviceAccount),
  });

  global._firebaseAdminAppInitialized = true;
}

export const firebaseAdminAuth = getAuth();
export const firebaseAdminDb = getFirestore();


