import { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import auth from "@react-native-firebase/auth";
import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLang } from "../../context/LangContext.jsx";
import { Button } from "../../components/index.jsx";

export default function OTPVerifyScreen({ route, navigation }) {
  const { role, phone } = route.params;
  const { verifyOTP, setVerification } = useAuth();
  const { t } = useLang();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  const handleChange = (val, idx) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleBackspace = (current, idx) => {
    if (!current && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) return Alert.alert("", "Enter the 6-digit OTP.");

    setLoading(true);
    try {
      const result = await verifyOTP(code, role);

      if (result?.needsProfessionalRegistration) {
        navigation.replace("ProfessionalRegister");
        return;
      }

      if (result?.isNew) {
        navigation.replace("ProfileSetup", { role });
      }
      // Existing users are routed by RootNavigator when AuthContext updates `user`.
    } catch (e) {
      Alert.alert(t.error, e.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const formatted = `+91${String(phone).replace(/\D/g, "")}`;
      const confirmation = await auth().signInWithPhoneNumber(formatted);
      setVerification(confirmation);
      Alert.alert("", t.otpSent);
    } catch (e) {
      Alert.alert(t.error, e.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <Text style={{ color: COLORS.accent, fontSize: 15, fontWeight: "600" }}>{"< Back"}</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>{t.verifyOTP}</Text>
        <Text style={styles.sub}>OTP sent to +91 {phone}</Text>

        <View style={styles.card}>
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(r) => (inputs.current[idx] = r)}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                value={digit}
                onChangeText={(v) => handleChange(v, idx)}
                onKeyPress={({ nativeEvent }) => nativeEvent.key === "Backspace" && handleBackspace(digit, idx)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                autoFocus={idx === 0}
              />
            ))}
          </View>

          <Button title={t.verify} onPress={handleVerify} loading={loading} />

          <TouchableOpacity onPress={handleResend} disabled={resending} style={{ alignItems: "center" }}>
            <Text style={{ color: COLORS.accent, fontWeight: "600", fontSize: 14 }}>
              {resending ? "Sending..." : t.resendOTP}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flex: 1, padding: 24, justifyContent: "center" },
  heading: { fontSize: 26, fontWeight: "800", color: COLORS.text, marginBottom: 6 },
  sub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 28 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 24, gap: 18, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  otpRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: "#f9fafb",
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  otpBoxFilled: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
});
