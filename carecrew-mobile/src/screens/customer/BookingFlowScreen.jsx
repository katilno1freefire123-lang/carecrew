import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
import { RAZORPAY_KEY_ID } from "../../constants/api.js";
import { useLang } from "../../context/LangContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { createBooking, cashPayment, createPaymentOrder, verifyPayment } from "../../services/api.js";
import { Button, Input } from "../../components/index.jsx";

const TIME_SLOTS = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"];

const toAddressText = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  if (typeof address === "object") return address.fullAddress || "";
  return "";
};

export default function BookingFlowScreen({ route, navigation }) {
  const { service } = route.params;
  const { user } = useAuth();
  const { t, pick } = useLang();

  const [address, setAddress] = useState(toAddressText(user?.address));
  const [date, setDate] = useState("");
  const [timeSlot, setTime] = useState("");
  const [payMethod, setPay] = useState("cash"); // "cash" | "online"
  const [loading, setLoading] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
  const fmtDate = (d) => d.toLocaleDateString("en-NP", { weekday: "short", day: "2-digit", month: "short" });
  const isoDate = (d) => d.toISOString().split("T")[0];

  const handleConfirm = async () => {
    if (!String(address).trim()) return Alert.alert("", "Address is required.");
    if (!date) return Alert.alert("", "Please select a date.");
    if (!timeSlot) return Alert.alert("", "Please select a time slot.");
    if (!user?._id) return Alert.alert(t.error, "User session missing. Please login again.");

    setLoading(true);
    try {
      const { data } = await createBooking({
        customerId: user._id,
        serviceId: service._id,
        date,
        timeSlot,
        address: { fullAddress: String(address).trim(), lat: 0, lng: 0 },
        paymentMethod: payMethod,
      });

      const bookingId = data.booking?._id;
      if (!bookingId) throw new Error("Booking was not created.");

      if (payMethod === "cash") {
        await cashPayment(bookingId);
        Alert.alert("Success", "Your booking is confirmed.", [{ text: "OK", onPress: () => navigation.navigate("MyBookings") }]);
        return;
      }

      const orderRes = await createPaymentOrder(bookingId);
      const order = orderRes?.data?.order;
      if (!order?.id || !order?.amount || !order?.currency) {
        throw new Error("Failed to create payment order.");
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "CareCrew",
        description: pick(service, "name") || "Service Booking",
        prefill: {
          name: user?.name || "",
          contact: (user?.phone || "").replace(/[^0-9]/g, "").slice(-10),
          email: "",
        },
        theme: { color: COLORS.accent || "#0ea5e9" },
      };

      const paymentData = await RazorpayCheckout.open(options);

      await verifyPayment({
        bookingId,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        method: "online",
      });

      Alert.alert("Success", "Online payment successful. Booking confirmed.", [
        { text: "OK", onPress: () => navigation.navigate("MyBookings") },
      ]);
    } catch (e) {
      if (e?.code === 2 || e?.description?.toLowerCase?.().includes("cancel")) {
        Alert.alert("Payment Cancelled", "You cancelled the payment.");
      } else {
        Alert.alert(t.error, e.response?.data?.error || e.response?.data?.message || e.message || "Payment failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ color: COLORS.accent, fontWeight: "700", fontSize: 15 }}>{"< Back"}</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>{t.bookService}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Service</Text>
        <Text style={styles.serviceName}>{pick(service, "name")}</Text>
        <Text style={{ color: COLORS.accent, fontWeight: "800", fontSize: 18, marginTop: 4 }}>
          {t.nrs} {service.price}
        </Text>
      </View>

      <View style={styles.card}>
        <Input label={t.address} value={address} onChangeText={setAddress} placeholder="Your full address" multiline />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t.selectDate}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {dates.map((d) => {
              const iso = isoDate(d);
              const sel = date === iso;
              return (
                <TouchableOpacity key={iso} onPress={() => setDate(iso)} style={[styles.dateBtn, sel && styles.dateBtnSel]}>
                  <Text style={[styles.dateText, sel && { color: "#fff" }]}>{fmtDate(d)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t.selectTime}</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((slot) => {
            const sel = timeSlot === slot;
            return (
              <TouchableOpacity key={slot} onPress={() => setTime(slot)} style={[styles.timeBtn, sel && styles.timeBtnSel]}>
                <Text style={[styles.timeText, sel && { color: "#fff" }]}>{slot}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t.paymentMethod}</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          {["cash", "online"].map((m) => (
            <TouchableOpacity key={m} onPress={() => setPay(m)} style={[styles.payBtn, payMethod === m && styles.payBtnSel]}>
              <Text style={{ fontSize: 16 }}>{m === "cash" ? "CASH" : "CARD"}</Text>
              <Text style={[styles.payText, payMethod === m && { color: COLORS.accent }]}>{t[m]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button title={t.confirmBooking} onPress={handleConfirm} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  heading: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  label: { fontSize: 11, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  serviceName: { fontSize: 17, fontWeight: "700", color: COLORS.text },
  dateBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "#f9fafb" },
  dateBtnSel: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  dateText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  timeBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "#f9fafb" },
  timeBtnSel: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  timeText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  payBtn: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "#f9fafb" },
  payBtnSel: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  payText: { fontWeight: "600", fontSize: 14, color: COLORS.text },
});
