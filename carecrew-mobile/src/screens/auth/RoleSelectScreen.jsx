import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
import { useLang } from "../../context/LangContext.jsx";

export default function RoleSelectScreen({ navigation }) {
  const { t, toggle } = useLang();

  const roles = [
    { key: "customer",     emoji: "🏠", desc: t.customerDesc },
    { key: "professional", emoji: "🔧", desc: t.professionalDesc },
  ];

  return (
    <View style={styles.container}>
      {/* Lang toggle */}
      <TouchableOpacity onPress={toggle} style={styles.langBtn}>
        <Text style={styles.langText}>{t.switchLang}</Text>
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.logoWrap}>
        <View style={styles.logoBox}>
          <Text style={styles.logoLetter}>C</Text>
        </View>
        <Text style={styles.logoName}>CareCrew</Text>
        <Text style={styles.logoSub}>Nepal's Home Services</Text>
      </View>

      <Text style={styles.title}>{t.selectRole}</Text>

      {roles.map((r) => (
        <TouchableOpacity
          key={r.key}
          style={styles.card}
          onPress={() => navigation.navigate("PhoneLogin", { role: r.key })}
          activeOpacity={0.85}
        >
          <Text style={styles.cardEmoji}>{r.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{t[r.key]}</Text>
            <Text style={styles.cardDesc}>{r.desc}</Text>
          </View>
          <Text style={{ color: COLORS.accent, fontSize: 20 }}>→</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 24, justifyContent: "center", gap: 16 },
  langBtn: {
    position: "absolute", top: 56, right: 24,
    backgroundColor: COLORS.accentLight, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  langText: { color: COLORS.accent, fontWeight: "700", fontSize: 12 },
  logoWrap: { alignItems: "center", marginBottom: 12, gap: 6 },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center",
    ...SHADOW.md,
  },
  logoLetter: { color: "#fff", fontSize: 30, fontWeight: "800" },
  logoName:   { fontSize: 26, fontWeight: "800", color: COLORS.text },
  logoSub:    { fontSize: 13, color: COLORS.textMuted },
  title:      { fontSize: 17, fontWeight: "700", color: COLORS.text, textAlign: "center", marginBottom: 4 },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: 20, flexDirection: "row", alignItems: "center", gap: 16,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm,
  },
  cardEmoji: { fontSize: 32 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text },
  cardDesc:  { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});
