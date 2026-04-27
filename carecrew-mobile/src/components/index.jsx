import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from "react-native";
import { COLORS, RADIUS } from "../constants/colors.js";

// ── Button ────────────────────────────────────────────────────────
export function Button({ title, onPress, loading, disabled, variant = "primary", style, textStyle }) {
  const bg = {
    primary: COLORS.accent,
    ghost:   COLORS.bg,
    danger:  COLORS.redLight,
    outline: "transparent",
  }[variant] || COLORS.accent;

  const color = {
    primary: "#fff",
    ghost:   COLORS.text,
    danger:  COLORS.red,
    outline: COLORS.accent,
  }[variant] || "#fff";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[{
        backgroundColor: bg,
        borderRadius: RADIUS.md,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        opacity: disabled || loading ? 0.6 : 1,
        borderWidth: variant === "outline" ? 1.5 : 0,
        borderColor: COLORS.accent,
      }, style]}
    >
      {loading && <ActivityIndicator size="small" color={color} />}
      <Text style={[{ color, fontWeight: "700", fontSize: 15 }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

// ── Badge ─────────────────────────────────────────────────────────
const BADGE_COLORS = {
  pending:   { bg: COLORS.yellowLight, text: COLORS.yellow },
  confirmed: { bg: COLORS.blueLight,   text: COLORS.blue },
  completed: { bg: COLORS.greenLight,  text: COLORS.green },
  cancelled: { bg: COLORS.redLight,    text: COLORS.red },
  approved:  { bg: COLORS.greenLight,  text: COLORS.green },
  rejected:  { bg: COLORS.redLight,    text: COLORS.red },
};

export function Badge({ label }) {
  const colors = BADGE_COLORS[label?.toLowerCase()] || { bg: "#f3f4f6", text: COLORS.textMuted };
  return (
    <View style={{ backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full }}>
      <Text style={{ color: colors.text, fontSize: 11, fontWeight: "700", textTransform: "capitalize" }}>{label}</Text>
    </View>
  );
}

// ── Card ──────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <View style={[{
      backgroundColor: COLORS.white,
      borderRadius: RADIUS.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }, style]}>
      {children}
    </View>
  );
}

// ── Screen Header ─────────────────────────────────────────────────
export function ScreenHeader({ title, right, left }) {
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: COLORS.white,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    }}>
      <View style={{ flex: 1 }}>{left || <View />}</View>
      <Text style={{ fontWeight: "800", fontSize: 17, color: COLORS.text, flex: 2, textAlign: "center" }}>{title}</Text>
      <View style={{ flex: 1, alignItems: "flex-end" }}>{right || <View />}</View>
    </View>
  );
}

// ── Empty State ───────────────────────────────────────────────────
export function EmptyState({ icon = "📭", message }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 }}>
      <Text style={{ fontSize: 48 }}>{icon}</Text>
      <Text style={{ color: COLORS.textMuted, fontSize: 15, textAlign: "center" }}>{message}</Text>
    </View>
  );
}

// ── Input ─────────────────────────────────────────────────────────
import { TextInput } from "react-native";
export function Input({ label, style, ...props }) {
  return (
    <View style={{ gap: 6 }}>
      {label && <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</Text>}
      <TextInput
        style={[{
          backgroundColor: "#f9fafb",
          borderWidth: 1,
          borderColor: COLORS.border,
          borderRadius: RADIUS.md,
          padding: 13,
          fontSize: 15,
          color: COLORS.text,
        }, style]}
        placeholderTextColor={COLORS.textDim}
        {...props}
      />
    </View>
  );
}

// ── Lang Toggle Button ─────────────────────────────────────────────
export function LangToggle({ label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{
      backgroundColor: COLORS.accentLight,
      borderRadius: RADIUS.full,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: COLORS.accent,
    }}>
      <Text style={{ color: COLORS.accent, fontWeight: "700", fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
}
