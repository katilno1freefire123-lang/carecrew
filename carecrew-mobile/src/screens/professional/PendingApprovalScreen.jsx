import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { COLORS } from "../../constants/colors.js";
import { useLang } from "../../context/LangContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getProfile } from "../../services/api.js";

export default function PendingApprovalScreen() {
  const { t } = useLang();
  const { logout, updateUser } = useAuth();
  const [checking, setChecking] = useState(false);

  const checkApprovalStatus = async () => {
    setChecking(true);
    try {
      const { data } = await getProfile();
      const professional = data?.professional;
      if (professional) {
        await updateUser(professional);
      }
    } catch (e) {
      // keep silent; user can retry
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkApprovalStatus();
    const timer = setInterval(checkApprovalStatus, 12000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert("", "Could not logout. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={{ fontSize: 48 }}>PENDING</Text>
      </View>
      <Text style={styles.title}>{t.pendingApproval}</Text>
      <Text style={styles.desc}>{t.pendingDesc}</Text>

      <View style={styles.steps}>
        {["KYC Submitted", "Under Review", "Get Approved"].map((label, i) => (
          <View key={label} style={styles.step}>
            <View style={[styles.stepIcon, i === 0 && styles.stepIconDone, i === 1 && styles.stepIconActive]}>
              <Text style={{ fontSize: 12, fontWeight: "700" }}>{i + 1}</Text>
            </View>
            <Text style={styles.stepLabel}>{label}</Text>
            {i < 2 && <View style={styles.stepLine} />}
          </View>
        ))}
      </View>

      <Text style={styles.note}>You will be notified once your KYC is approved. This usually takes 24-48 hours.</Text>

      <TouchableOpacity onPress={checkApprovalStatus} style={styles.refreshBtn}>
        <Text style={styles.refreshText}>{checking ? "Checking..." : "Refresh Status"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={{ color: COLORS.red, fontWeight: "600" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center", padding: 32, gap: 20 },
  iconWrap: { width: 140, height: 70, borderRadius: 12, backgroundColor: COLORS.yellowLight, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text, textAlign: "center" },
  desc: { fontSize: 15, color: COLORS.textMuted, textAlign: "center", lineHeight: 22 },
  steps: { flexDirection: "row", alignItems: "center", gap: 0, marginVertical: 8 },
  step: { alignItems: "center", gap: 6, position: "relative" },
  stepIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.border },
  stepIconDone: { borderColor: COLORS.green, backgroundColor: COLORS.greenLight },
  stepIconActive: { borderColor: COLORS.yellow, backgroundColor: COLORS.yellowLight },
  stepLabel: { fontSize: 11, color: COLORS.textMuted, textAlign: "center", maxWidth: 70 },
  stepLine: { position: "absolute", right: -24, top: 18, width: 40, height: 2, backgroundColor: COLORS.border },
  note: { fontSize: 13, color: COLORS.textDim, textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
  refreshBtn: { marginTop: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  refreshText: { color: COLORS.accent, fontWeight: "700" },
  logoutBtn: { marginTop: 2, padding: 12 },
});
