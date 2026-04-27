import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
import { useLang } from "../../context/LangContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { createReview } from "../../services/api.js";
import { Button } from "../../components/index.jsx";

export default function ReviewScreen({ route, navigation }) {
  const { booking } = route.params;
  const { t } = useLang();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return Alert.alert("", "Please select a rating.");
    if (!user?._id) return Alert.alert(t.error, "User session missing. Please login again.");

    setLoading(true);
    try {
      await createReview({
        bookingId: booking._id,
        customerId: user._id,
        rating,
        comment: comment.trim(),
      });

      Alert.alert("Success", "Review submitted!", [{ text: "OK", onPress: () => navigation.navigate("MyBookings") }]);
    } catch (e) {
      Alert.alert(t.error, e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ color: COLORS.accent, fontWeight: "700", fontSize: 15 }}>{"< Back"}</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>{t.writeReview}</Text>

      <View style={styles.card}>
        <Text style={styles.serviceName}>{booking.serviceId?.name || "Service"}</Text>
        {booking.professionalId?.name && <Text style={styles.proName}>by {booking.professionalId.name}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t.rating}</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Text style={{ fontSize: 40, color: s <= rating ? "#f59e0b" : COLORS.border }}>{"\u2B50"}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating] || "Tap to rate"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t.comment}</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Share your experience..."
          placeholderTextColor={COLORS.textDim}
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
        />
      </View>

      <Button title={t.submitReview} onPress={handleSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm, gap: 8 },
  serviceName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  proName: { fontSize: 13, color: COLORS.textMuted },
  label: { fontSize: 11, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  stars: { flexDirection: "row", justifyContent: "center", gap: 4 },
  textarea: { backgroundColor: "#f9fafb", borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: 12, fontSize: 14, color: COLORS.text, minHeight: 100, textAlignVertical: "top" },
});
