import { useMemo, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, RADIUS, SHADOW } from "../constants/colors.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import { getProfessionalProfile, getProfessionalReviews, updateProfile } from "../services/api.js";
import { Button, Input, LangToggle } from "../components/index.jsx";

const toAddressText = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  return address.fullAddress || "";
};

export default function ProfileScreen() {
  const { user, role, updateUser, logout } = useAuth();
  const { t, toggle } = useLang();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [address, setAddress] = useState(toAddressText(user?.address));
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);

  const kycLabel = useMemo(() => user?.kycStatus || user?.status || "pending", [user]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadProfessionalData = async () => {
        if (role !== "professional" || !user?._id) return;
        try {
          const [{ data: pData }, { data: rData }] = await Promise.all([
            getProfessionalProfile(user._id),
            getProfessionalReviews(user._id),
          ]);
          if (!active) return;
          if (pData?.professional) await updateUser(pData.professional);
          setReviews(rData?.reviews || []);
        } catch {
          // ignore profile polling errors
        }
      };
      loadProfessionalData();
      const timer = setInterval(loadProfessionalData, 5000);
      return () => {
        active = false;
        clearInterval(timer);
      };
    }, [role, user?._id])
  );

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await updateProfile({ name: name.trim(), address: address.trim() });
      await updateUser(data.user || data.professional);
      setEditing(false);
    } catch (e) {
      Alert.alert(t.error, e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t.logout, "Are you sure?", [
      { text: t.cancel, style: "cancel" },
      { text: t.logout, style: "destructive", onPress: logout },
    ]);
  };

  const avgFromReviews = reviews.length ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1) : null;
  const displayRating = avgFromReviews || (user?.rating ? Number(user.rating).toFixed(1) : "-");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "?"}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || "No name set"}</Text>
        <Text style={styles.userPhone}>{user?.phone}</Text>
        <View style={[styles.roleBadge, role === "professional" && { backgroundColor: COLORS.blueLight }]}>
          <Text style={[styles.roleText, role === "professional" && { color: COLORS.blue }]}>{role === "customer" ? "Customer" : "Professional"}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.cardLabel}>{"Language / \u092D\u093E\u0937\u093E"}</Text>
          <LangToggle label={t.switchLang} onPress={toggle} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={styles.cardLabel}>Profile Info</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={{ color: COLORS.accent, fontWeight: "600", fontSize: 14 }}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {editing ? (
          <View style={{ gap: 12 }}>
            <Input label={t.fullName} value={name} onChangeText={setName} />
            <Input label={t.address} value={address} onChangeText={setAddress} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button title={t.cancel} variant="ghost" onPress={() => setEditing(false)} style={{ flex: 1 }} />
              <Button title={t.save} onPress={handleSave} loading={loading} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {[
              [t.fullName, user?.name || "-"],
              [t.address, toAddressText(user?.address) || "-"],
            ].map(([label, val]) => (
              <View key={label}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.fieldVal}>{val}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {role === "professional" && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{displayRating}</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{user?.completedJobs || 0}</Text>
                <Text style={styles.statLabel}>Jobs Done</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: kycLabel === "approved" ? COLORS.green : COLORS.yellow, fontSize: 12 }]}>{kycLabel}</Text>
                <Text style={styles.statLabel}>KYC</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Recent Reviews</Text>
            {reviews.length === 0 ? (
              <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>No reviews yet.</Text>
            ) : (
              reviews.slice(0, 5).map((r) => (
                <View key={r._id} style={styles.reviewRow}>
                  <Text style={styles.reviewStars}>{"\u2B50".repeat(Math.max(1, Math.min(5, Number(r.rating) || 0)))}</Text>
                  <Text style={styles.reviewText} numberOfLines={2}>{r.comment || "(No comment)"}</Text>
                </View>
              ))
            )}
          </View>
        </>
      )}

      <Button title={t.logout} variant="danger" onPress={handleLogout} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  avatarSection: { alignItems: "center", gap: 8, paddingVertical: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 32, fontWeight: "800", color: "#fff" },
  userName: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  userPhone: { fontSize: 14, color: COLORS.textMuted },
  roleBadge: { backgroundColor: COLORS.accentLight, paddingHorizontal: 14, paddingVertical: 4, borderRadius: RADIUS.full },
  roleText: { color: COLORS.accent, fontWeight: "700", fontSize: 12 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  cardLabel: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  fieldLabel: { fontSize: 11, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  fieldVal: { fontSize: 14, color: COLORS.text, fontWeight: "500" },
  statsRow: { flexDirection: "row", marginTop: 12 },
  statBox: { flex: 1, alignItems: "center", gap: 4 },
  statVal: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textMuted },
  reviewRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 4 },
  reviewStars: { color: "#f59e0b", fontWeight: "700" },
  reviewText: { color: COLORS.textMuted, fontSize: 13 },
});
