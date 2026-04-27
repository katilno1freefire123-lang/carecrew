import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { COLORS, RADIUS, SHADOW } from "../constants/colors.js";
import { useLang } from "../context/LangContext.jsx";
import { getNotifications, markNotificationRead, markAllRead } from "../services/api.js";

export default function NotificationsScreen({ navigation }) {
  const { t } = useLang();
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getNotifications()
      .then(({ data }) => setNotifs(data.notifications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleRead = async (id) => {
    await markNotificationRead(id).catch(console.error);
    setNotifs((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
  };

  const handleReadAll = async () => {
    await markAllRead().catch(console.error);
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const fmt = (d) => new Date(d).toLocaleString("en-NP", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontWeight: "700" }}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t.notifications}</Text>
        <TouchableOpacity onPress={handleReadAll}>
          <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: "600" }}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accent} />}
      >
        {notifs.length === 0 && !loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Text style={{ fontSize: 48 }}>🔔</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 15 }}>{t.noNotifications}</Text>
          </View>
        ) : (
          notifs.map((n) => (
            <TouchableOpacity key={n._id} style={[styles.notifCard, n.isRead && styles.notifRead]} onPress={() => handleRead(n._id)}>
              {!n.isRead && <View style={styles.dot} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifMsg}>{n.message}</Text>
                <Text style={styles.notifTime}>{fmt(n.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.bg },
  header:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, paddingTop: 52, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title:      { fontSize: 17, fontWeight: "800", color: COLORS.text },
  notifCard:  { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 14, borderWidth: 1, borderColor: COLORS.accent, ...SHADOW.sm, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  notifRead:  { borderColor: COLORS.border, opacity: 0.7 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent, marginTop: 6 },
  notifTitle: { fontWeight: "700", fontSize: 14, color: COLORS.text },
  notifMsg:   { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  notifTime:  { fontSize: 11, color: COLORS.textDim, marginTop: 4 },
});
