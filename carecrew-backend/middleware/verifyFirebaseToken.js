import { getFirebaseAdmin } from "../config/firebase.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid Authorization header." });
    }

    const token = authHeader.split(" ")[1];
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.firebaseUser = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Firebase token verification failed.", error: error.message });
  }
};