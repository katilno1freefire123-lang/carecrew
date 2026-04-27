import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, StyleSheet } from "react-native";
import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
import { useLang } from "../../context/LangContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getProfessionalTasks, completeBooking } from "../../services/api.js";
import { EmptyState } from "../../components/index.jsx";

export default function TasksScreen() {
  const { t } = useLang();
  const { user, updateUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState("");

  const load = () => {
    if (!user?._id) return;
    setLoading(true);
    getProfessionalTasks(user._id)
      .then(({ data }) => setTasks(data.tasks || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(load, [user?._id]);

  const handleComplete = async (id) => {
    Alert.alert("Complete Job?", "Confirm that this job is done.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          setActing(id);
          try {
            await completeBooking(id);
            setTasks((prev) => prev.map((task) => (task._id === id ? { ...task, status: "completed" } : task)));
            await updateUser({ ...(user || {}), completedJobs: (user?.completedJobs || 0) + 1 });
          } catch (e) {
            Alert.alert(t.error, e.response?.data?.message || e.message);
          } finally {
            setActing("");
          }
        },
      },
    ]);
  };

  const fmt = (d) => new Date(d).toLocaleDateString("en-NP", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accent} />}
    >
      <Text style={styles.sectionTitle}>
        {t.myTasks} ({tasks.length})
      </Text>

      {tasks.length === 0 && !loading ? (
        <EmptyState icon="Tasks" message="No active tasks right now" />
      ) : (
        tasks.map((task) => (
          <View key={task._id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.serviceName}>{task.serviceId?.name || "Service"}</Text>
              <Text style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: "700" }}>{task.status}</Text>
            </View>

            <View style={styles.customerRow}>
              <Text style={{ fontSize: 13, color: COLORS.textMuted }}>
                Customer: <Text style={{ fontWeight: "700", color: COLORS.text }}>{task.customerId?.name || "-"}</Text>
              </Text>
              {task.customerId?.phone && <Text style={{ fontSize: 12, color: COLORS.accent, fontWeight: "600" }}>Phone: {task.customerId.phone}</Text>}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.info}>Date: {fmt(task.date)}</Text>
              <Text style={styles.info}>Time: {task.timeSlot}</Text>
              <Text style={styles.info}>Amount: Rs {task.amount}</Text>
            </View>

            {task.address?.fullAddress && (
              <Text style={styles.address} numberOfLines={2}>
                Address: {task.address.fullAddress}
              </Text>
            )}

            {task.status === "confirmed" && (
              <TouchableOpacity style={[styles.completeBtn, acting === task._id && { opacity: 0.5 }]} onPress={() => handleComplete(task._id)} disabled={!!acting}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{acting === task._id ? "..." : "Complete"}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, gap: 10, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  serviceName: { fontSize: 15, fontWeight: "700", color: COLORS.text, flex: 1 },
  customerRow: { gap: 3 },
  infoRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  info: { fontSize: 12, color: COLORS.textMuted },
  address: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  completeBtn: { backgroundColor: COLORS.green, borderRadius: RADIUS.md, padding: 12, alignItems: "center", marginTop: 4 },
});
