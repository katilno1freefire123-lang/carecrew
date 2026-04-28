import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
import { useLang } from "../../context/LangContext.jsx";
import { Button } from "../../components/index.jsx";
import { SOCKET_BASE } from "../../constants/api.js";

const getImageUri = (image) => {
  if (!image) return null;
  return image.startsWith("http") ? image : `${SOCKET_BASE}${image}`;
};

export default function ServiceDetailScreen({ route, navigation }) {
  const { service } = route.params;
  const { t, pick } = useLang();

  const imgUri = getImageUri(service.image);

  return (
    <ScrollView style={styles.container}>
      {/* Back */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={{ color: COLORS.accent, fontWeight: "700", fontSize: 15 }}>← Back</Text>
      </TouchableOpacity>

      {/* Image */}
      <View style={styles.imgWrap}>
        {imgUri ? (
          <Image source={{ uri: imgUri }} style={styles.img} />
        ) : (
          <View style={[styles.img, { alignItems: "center", justifyContent: "center", backgroundColor: COLORS.accentLight }]}>
            <Text style={{ fontSize: 64 }}>🔧</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{pick(service, "name")}</Text>
        <Text style={styles.desc}>{pick(service, "description")}</Text>

        {/* Info row */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>{t.price}</Text>
            <Text style={styles.infoVal}>{t.nrs} {service.price}</Text>
          </View>
          <View style={[styles.infoBox, { borderLeftWidth: 1, borderLeftColor: COLORS.border }]}>
            <Text style={styles.infoLabel}>{t.duration}</Text>
            <Text style={styles.infoVal}>{service.duration} {t.minutes}</Text>
          </View>
        </View>

        {/* What's included */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's included</Text>
          {[
            "Certified & verified professional",
            "All tools & equipment provided",
            "Service warranty included",
            "On-time guarantee",
          ].map((item, i) => (
            <View key={i} style={styles.checkRow}>
              <Text style={{ color: COLORS.green, fontSize: 16 }}>✓</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>{item}</Text>
            </View>
          ))}
        </View>

        <Button
          title={`${t.bookNow} — ${t.nrs} ${service.price}`}
          onPress={() => navigation.navigate("BookingFlow", { service })}
          style={{ marginTop: 8 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  backBtn:      { position: "absolute", top: 52, left: 20, zIndex: 10, backgroundColor: COLORS.white, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 7, ...SHADOW.sm },
  imgWrap:      { height: 260, backgroundColor: COLORS.accentLight },
  img:          { width: "100%", height: 260, resizeMode: "cover" },
  content:      { padding: 20, gap: 14 },
  name:         { fontSize: 24, fontWeight: "800", color: COLORS.text },
  desc:         { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },
  infoRow:      { flexDirection: "row", backgroundColor: COLORS.white, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  infoBox:      { flex: 1, padding: 16, alignItems: "center", gap: 4 },
  infoLabel:    { fontSize: 11, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "600" },
  infoVal:      { fontSize: 20, fontWeight: "800", color: COLORS.text },
  section:      { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  checkRow:     { flexDirection: "row", alignItems: "center", gap: 10 },
});
