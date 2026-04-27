import { createContext, useContext, useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import * as SecureStore from "expo-secure-store";
import { customerLogin, professionalLogin } from "../services/api.js";

const AuthContext = createContext(null);
let _confirmation = null;

const getApiErrorMessage = (error, fallback) => {
  const serverError = error?.response?.data?.error;
  const serverMessage = error?.response?.data?.message;
  return serverError || serverMessage || error?.message || fallback;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const savedRole = await SecureStore.getItemAsync("role");
        const savedUser = await SecureStore.getItemAsync("user");
        if (savedRole) setRole(savedRole);
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch (_) {
        // ignore restore errors
      }
      setLoading(false);
    };

    restore();
  }, []);

  const setVerification = (confirmation) => {
    _confirmation = confirmation;
  };

  const verifyOTP = async (otp, selectedRole) => {
    if (!_confirmation) {
      throw new Error("No OTP confirmation found. Please request OTP again.");
    }

    const result = await _confirmation.confirm(otp);
    const token = await result.user.getIdToken();

    setRole(selectedRole);
    await SecureStore.setItemAsync("role", selectedRole);

    if (selectedRole === "customer") {
      try {
        const { data } = await customerLogin(token);
        const userObj = data.user;
        const needsProfileSetup = !!data.isNew || !userObj?.profileComplete;

        if (!needsProfileSetup) {
          setUser(userObj);
          await SecureStore.setItemAsync("user", JSON.stringify(userObj));
        } else {
          await SecureStore.deleteItemAsync("user");
        }

        return {
          user: needsProfileSetup ? null : userObj,
          role: selectedRole,
          isNew: needsProfileSetup,
        };
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "Customer login failed."));
      }
    }

    try {
      const { data } = await professionalLogin(token);

      if (data?.registered === false) {
        return {
          user: null,
          role: selectedRole,
          isNew: true,
          needsProfessionalRegistration: true,
        };
      }

      const userObj = data.professional;
      setUser(userObj);
      await SecureStore.setItemAsync("user", JSON.stringify(userObj));
      return { user: userObj, role: selectedRole, isNew: false };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Professional login failed."));
    }
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    await SecureStore.setItemAsync("user", JSON.stringify(updatedUser));
  };

  const getToken = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) return null;
    return currentUser.getIdToken();
  };

  const logout = async () => {
    _confirmation = null;

    // Clear local app session first so UI immediately exits authenticated flow.
    setUser(null);
    setRole(null);

    await SecureStore.deleteItemAsync("role");
    await SecureStore.deleteItemAsync("user");

    // Best-effort Firebase sign-out (do not block local logout if this fails/hangs).
    auth().signOut().catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        setVerification,
        verifyOTP,
        updateUser,
        getToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
