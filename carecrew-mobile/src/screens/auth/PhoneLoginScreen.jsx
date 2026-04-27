import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import auth from "@react-native-firebase/auth";
import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLang } from "../../context/LangContext.jsx";
import { Button } from "../../components/index.jsx";

export default function PhoneLoginScreen({ route, navigation }) {
  const { role } = route.params;
  const { setVerification } = useAuth();
  const { t } = useLang();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) return Alert.alert("", "Valid phone number required.");

    setLoading(true);
    try {
      const formatted = `+91${digits}`;
      const confirmation = await auth().signInWithPhoneNumber(formatted);
      setVerification(confirmation);
      navigation.navigate("OTPVerify", { role, phone: digits });
    } catch (e) {
      Alert.alert(t.error, e.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <Text style={{ color: COLORS.accent, fontSize: 15, fontWeight: "600" }}>{"< Back"}</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>{t.phoneLogin}</Text>
        <Text style={styles.sub}>{role === "customer" ? t.customerDesc : t.professionalDesc}</Text>

        <View style={styles.card}>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder={t.phoneHint}
              placeholderTextColor={COLORS.textDim}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              autoFocus
            />
          </View>

          <Button title={t.sendOTP} onPress={handleSend} loading={loading} style={{ marginTop: 8 }} />
        </View>

        <Text style={styles.hint}>OTP will be sent via SMS to your number.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flex: 1, padding: 24, justifyContent: "center" },
  heading: { fontSize: 26, fontWeight: "800", color: COLORS.text, marginBottom: 6 },
  sub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 28 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 20, gap: 14, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  phoneRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  countryCode: { backgroundColor: "#f3f4f6", borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 13, borderWidth: 1, borderColor: COLORS.border },
  countryText: { fontWeight: "600", fontSize: 14, color: COLORS.text },
  input: { flex: 1, backgroundColor: "#f9fafb", borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: 13, fontSize: 16, color: COLORS.text, fontWeight: "600" },
  hint: { color: COLORS.textDim, fontSize: 12, textAlign: "center", marginTop: 20 },
});
