import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
import { useLang } from "../../context/LangContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getCustomerBookings } from "../../services/api.js";
import { Badge, EmptyState } from "../../components/index.jsx";

const TABS = ["all", "pending", "confirmed", "completed", "cancelled"];

export default function MyBookingsScreen({ navigation }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const load = () => {
    if (!user?._id) return;
    setLoading(true);
    getCustomerBookings(user._id)
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, [user?._id]);

  const filtered = tab === "all" ? bookings : bookings.filter((b) => b.status === tab);
  const fmt = (d) => new Date(d).toLocaleDateString("en-NP", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
        {TABS.map((tb) => (
          <TouchableOpacity key={tb} onPress={() => setTab(tb)} style={[styles.tab, tab === tb && styles.tabActive]}>
            <Text style={[styles.tabText, tab === tb && styles.tabTextActive]}>{t[tb] || tb}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accent} />}
      >
        {filtered.length === 0 && !loading ? (
          <EmptyState icon="Bookings" message={t.noBookings} />
        ) : (
          filtered.map((b) => (
            <View key={b._id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.serviceName}>{b.serviceId?.name || "Service"}</Text>
                <Badge label={b.status} />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoItem}>Date: {fmt(b.date)}</Text>
                <Text style={styles.infoItem}>Time: {b.timeSlot || "-"}</Text>
                <Text style={styles.infoItem}>Amount: Rs {b.amount}</Text>
              </View>

              {b.professionalId && (
                <View style={styles.proRow}>
                  <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
                    Professional: <Text style={{ fontWeight: "700", color: COLORS.text }}>{b.professionalId.name}</Text>
                  </Text>
                </View>
              )}

              {b.status === "completed" && !b.reviewed && (
                <TouchableOpacity style={styles.reviewBtn} onPress={() => navigation.navigate("Review", { booking: b })}>
                  <Text style={styles.reviewBtnText}>Write Review</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  tabScroll: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, maxHeight: 52 },
  tabRow: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted, textTransform: "capitalize" },
  tabTextActive: { color: "#fff" },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, gap: 10, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  serviceName: { fontSize: 15, fontWeight: "700", color: COLORS.text, flex: 1 },
  infoRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  infoItem: { fontSize: 12, color: COLORS.textMuted },
  proRow: { paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  reviewBtn: { backgroundColor: COLORS.accentLight, borderRadius: RADIUS.md, padding: 10, alignItems: "center", borderWidth: 1, borderColor: COLORS.accent },
  reviewBtnText: { color: COLORS.accent, fontWeight: "700", fontSize: 13 },
});
