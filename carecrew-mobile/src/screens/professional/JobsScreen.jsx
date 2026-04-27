import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Switch, Alert } from "react-native";
import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
import { useLang } from "../../context/LangContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getProfessionalJobs, acceptBooking, rejectBooking, toggleOnline } from "../../services/api.js";
import { connectSocket, disconnectSocket } from "../../socket/index.js";
import { EmptyState } from "../../components/index.jsx";

export default function JobsScreen() {
  const { t } = useLang();
  const { user, updateUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [acting, setActing] = useState("");

  const load = useCallback(() => {
    if (!user?._id) return;
    setLoading(true);
    getProfessionalJobs(user._id)
      .then(({ data }) => setJobs(data.jobs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?._id]);

  useEffect(() => {
    load();
    const socket = connectSocket(user?._id);
    socket.on("new_job", (booking) => {
      setJobs((prev) => [booking, ...prev]);
    });
    socket.on("job_taken", ({ bookingId }) => {
      setJobs((prev) => prev.filter((j) => j._id !== bookingId));
    });
    return () => disconnectSocket();
  }, [load, user?._id]);

  const handleToggleOnline = async (val) => {
    setIsOnline(val);
    try {
      const { data } = await toggleOnline(user._id);
      await updateUser(data.professional);
    } catch {
      setIsOnline(!val);
    }
  };

  const handleAccept = async (id) => {
    setActing(id);
    try {
      await acceptBooking(id, user._id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (e) {
      Alert.alert(t.error, e.response?.data?.message || "Could not accept job.");
    } finally {
      setActing("");
    }
  };

  const handleReject = async (id) => {
    setActing(id + "r");
    try {
      await rejectBooking(id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch {
      // no-op
    } finally {
      setActing("");
    }
  };

  const fmt = (d) => new Date(d).toLocaleDateString("en-NP", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <View style={styles.container}>
      <View style={styles.onlineBar}>
        <View>
          <Text style={styles.onlineTitle}>{isOnline ? t.goOffline : t.goOnline}</Text>
          <Text style={styles.onlineSub}>{isOnline ? "You are visible to customers" : "Go online to receive jobs"}</Text>
        </View>
        <Switch value={isOnline} onValueChange={handleToggleOnline} trackColor={{ false: COLORS.border, true: COLORS.accent }} thumbColor="#fff" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accent} />}
      >
        <Text style={styles.sectionTitle}>
          {t.availableJobs} ({jobs.length})
        </Text>

        {jobs.length === 0 && !loading ? (
          <EmptyState icon="Jobs" message={isOnline ? "No jobs available right now" : "Go online to receive job requests"} />
        ) : (
          jobs.map((job) => (
            <View key={job._id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.serviceName}>{job.serviceId?.name || "Service"}</Text>
                <Text style={styles.amount}>Rs {job.amount}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.info}>Date: {fmt(job.date)}</Text>
                <Text style={styles.info}>Time: {job.timeSlot}</Text>
                <Text style={styles.info}>Pay: {job.payment?.method}</Text>
              </View>

              {job.address?.fullAddress && (
                <Text style={styles.address} numberOfLines={2}>
                  Address: {job.address.fullAddress}
                </Text>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.rejectBtn, acting === job._id + "r" && { opacity: 0.5 }]} onPress={() => handleReject(job._id)} disabled={!!acting}>
                  <Text style={{ color: COLORS.red, fontWeight: "700" }}>{t.reject}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.acceptBtn, acting === job._id && { opacity: 0.5 }]} onPress={() => handleAccept(job._id)} disabled={!!acting}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>{acting === job._id ? "..." : t.accept}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  onlineBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.white, padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  onlineTitle: { fontWeight: "700", fontSize: 15, color: COLORS.text },
  onlineSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, gap: 10, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  serviceName: { fontSize: 15, fontWeight: "700", color: COLORS.text, flex: 1 },
  amount: { fontSize: 17, fontWeight: "800", color: COLORS.accent },
  infoRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  info: { fontSize: 12, color: COLORS.textMuted },
  address: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  rejectBtn: { flex: 1, padding: 11, borderRadius: RADIUS.md, alignItems: "center", borderWidth: 1, borderColor: COLORS.red, backgroundColor: COLORS.redLight },
  acceptBtn: { flex: 2, padding: 11, borderRadius: RADIUS.md, alignItems: "center", backgroundColor: COLORS.accent },
});
