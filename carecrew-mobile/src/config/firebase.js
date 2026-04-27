import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey:            "AIzaSyDFSW8fa5cz2-hUb2jkn9RjVWugNGBN_N8",
  authDomain:        "carecrew-9f2e3.firebaseapp.com",
  projectId:         "carecrew-9f2e3",
  storageBucket:     "carecrew-9f2e3.firebasestorage.app",
  messagingSenderId: "569690762482",
  appId:             "1:569690762482:web:31cf80769c9ca7ddbef46b",
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export default app;