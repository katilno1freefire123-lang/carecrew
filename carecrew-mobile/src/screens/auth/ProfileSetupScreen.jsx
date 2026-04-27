// import { useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
// import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
// import { useAuth } from "../../context/AuthContext.jsx";
// import { useLang } from "../../context/LangContext.jsx";
// import { updateProfile } from "../../services/api.js";
// import { Button, Input } from "../../components/index.jsx";

// export default function ProfileSetupScreen({ route, navigation }) {
//   const { role } = route.params || {};
//   const { updateUser } = useAuth();
//   const { t } = useLang();
//   const [name, setName]       = useState("");
//   const [address, setAddress] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSave = async () => {
//     if (!name.trim()) return Alert.alert("", "Name is required.");
//     setLoading(true);
//     try {
//       const { data } = await updateProfile({ name: name.trim(), address: address.trim(), profileComplete: true });
//       await updateUser(data.user || data.professional);
//       // Navigation handled by RootNavigator watching user.profileComplete
//     } catch (e) {
//       Alert.alert(t.error, e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.content}>
//       <View style={styles.header}>
//         <View style={styles.avatar}>
//           <Text style={{ fontSize: 36 }}>👤</Text>
//         </View>
//         <Text style={styles.heading}>{t.setupProfile}</Text>
//         <Text style={styles.sub}>Tell us a bit about yourself</Text>
//       </View>

//       <View style={styles.card}>
//         <Input
//           label={t.fullName}
//           placeholder="Ram Bahadur Shrestha"
//           value={name}
//           onChangeText={setName}
//           autoFocus
//         />
//         <Input
//           label={t.address}
//           placeholder="Kathmandu, Bagmati"
//           value={address}
//           onChangeText={setAddress}
//         />
//         <Button title={t.save} onPress={handleSave} loading={loading} style={{ marginTop: 4 }} />
//       </View>

//       <Text style={styles.note}>
//         You can update your profile anytime from the Profile tab.
//       </Text>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.bg },
//   content:   { padding: 24, gap: 20, paddingTop: 60 },
//   header:    { alignItems: "center", gap: 8, marginBottom: 8 },
//   avatar:    {
//     width: 80, height: 80, borderRadius: 40,
//     backgroundColor: COLORS.accentLight, alignItems: "center", justifyContent: "center",
//     borderWidth: 2, borderColor: COLORS.accent,
//   },
//   heading:   { fontSize: 24, fontWeight: "800", color: COLORS.text },
//   sub:       { fontSize: 14, color: COLORS.textMuted },
//   card:      { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 20, gap: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
//   note:      { color: COLORS.textDim, fontSize: 12, textAlign: "center" },
// });
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLang } from "../../context/LangContext.jsx";
import { updateProfile } from "../../services/api.js";
import { Button, Input } from "../../components/index.jsx";

export default function ProfileSetupScreen({ route, navigation }) {
  const { role } = route.params || {};
  const { updateUser } = useAuth();
  const { t } = useLang();
  const [name, setName]       = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("", "Name is required.");
    setLoading(true);
    try {
      const { data } = await updateProfile({ name: name.trim(), address: address.trim(), profileComplete: true });
      const updated = data.user || data.professional;
      await updateUser(updated);
      // RootNavigator watches `user` — updating it will trigger re-render.
      // Customers auto-land on CustomerTabs.
      // Professionals need to register KYC before approval; send them there.
      if (role === "professional") {
        navigation.replace("ProfessionalRegister");
      }
    } catch (e) {
      Alert.alert(t.error, e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 36 }}>👤</Text>
        </View>
        <Text style={styles.heading}>{t.setupProfile}</Text>
        <Text style={styles.sub}>Tell us a bit about yourself</Text>
      </View>

      <View style={styles.card}>
        <Input
          label={t.fullName}
          placeholder="Ram Bahadur Shrestha"
          value={name}
          onChangeText={setName}
          autoFocus
        />
        <Input
          label={t.address}
          placeholder="Kathmandu, Bagmati"
          value={address}
          onChangeText={setAddress}
        />
        <Button title={t.save} onPress={handleSave} loading={loading} style={{ marginTop: 4 }} />
      </View>

      <Text style={styles.note}>
        You can update your profile anytime from the Profile tab.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content:   { padding: 24, gap: 20, paddingTop: 60 },
  header:    { alignItems: "center", gap: 8, marginBottom: 8 },
  avatar:    {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.accentLight, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: COLORS.accent,
  },
  heading:   { fontSize: 24, fontWeight: "800", color: COLORS.text },
  sub:       { fontSize: 14, color: COLORS.textMuted },
  card:      { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 20, gap: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  note:      { color: COLORS.textDim, fontSize: 12, textAlign: "center" },
});
