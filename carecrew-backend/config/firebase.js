import admin from "firebase-admin";

let initialized = false;

const buildServiceAccount = () => {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return null;
  }

  const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  if (parsed.private_key) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }

  return parsed;
};

const initializeFirebase = () => {
  if (initialized) {
    return;
  }

  if (admin.apps.length > 0) {
    initialized = true;
    return;
  }

  const serviceAccount = buildServiceAccount();

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }

  initialized = true;
};

export const getFirebaseAdmin = () => {
  initializeFirebase();
  return admin;
};