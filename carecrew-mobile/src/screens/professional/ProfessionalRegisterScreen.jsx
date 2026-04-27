import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
import { useLang } from "../../context/LangContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAllServices, registerProfessional } from "../../services/api.js";
import { Button, Input } from "../../components/index.jsx";

const MAX_DOC_SIZE_MB = 5;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];

const isAllowedType = (asset) => {
  const mime = String(asset?.mimeType || "").toLowerCase();
  if (ALLOWED_TYPES.includes(mime)) return true;
  const name = String(asset?.name || "").toLowerCase();
  return [".pdf", ".jpg", ".jpeg", ".png", ".webp"].some((ext) => name.endsWith(ext));
};

export default function ProfessionalRegisterScreen({ navigation }) {
  const { t, pick } = useLang();
  const { updateUser } = useAuth();
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedSkills, setSkills] = useState([]);
  const [aadhar, setAadhar] = useState(null);
  const [pan, setPan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllServices().then(({ data }) => setServices(data.services || [])).catch(console.error);
  }, []);

  const toggleSkill = (skillName) => {
    setSkills((prev) => (prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]));
  };

  const pickDoc = async (setter) => {
    const res = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"] });
    if (res.canceled) return;

    const file = res.assets?.[0];
    if (!file) return;

    if (!isAllowedType(file)) {
      Alert.alert("", "Only PDF, JPG, JPEG, PNG or WEBP files are allowed.");
      return;
    }

    const sizeBytes = Number(file.size || 0);
    if (sizeBytes > MAX_DOC_SIZE_MB * 1024 * 1024) {
      Alert.alert("", `File is too large. Max size is ${MAX_DOC_SIZE_MB} MB.`);
      return;
    }

    setter(file);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert("", "Name is required.");
    if (selectedSkills.length === 0) return Alert.alert("", "Select at least one skill.");
    if (!aadhar) return Alert.alert("", "Aadhaar document is required.");
    if (!pan) return Alert.alert("", "PAN document is required.");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("skills", JSON.stringify(selectedSkills));
      fd.append("experience", experience || "0");
      fd.append("aadhar", { uri: aadhar.uri, type: aadhar.mimeType || "application/octet-stream", name: aadhar.name || "aadhar" });
      fd.append("pan", { uri: pan.uri, type: pan.mimeType || "application/octet-stream", name: pan.name || "pan" });

      const { data } = await registerProfessional(fd);
      await updateUser(data.professional);
      navigation.replace("PendingApproval");
    } catch (e) {
      Alert.alert(t.error, e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t.registerPro}</Text>

      <View style={styles.card}>
        <Input label={t.fullName} value={name} onChangeText={setName} placeholder="Your full name" />
        <Input label={t.experience} value={experience} onChangeText={setExperience} placeholder="2" keyboardType="number-pad" />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t.skills}</Text>
        <View style={styles.skillsGrid}>
          {services.map((s) => {
            const sel = selectedSkills.includes(s.name);
            return (
              <TouchableOpacity key={s._id} onPress={() => toggleSkill(s.name)} style={[styles.skillChip, sel && styles.skillChipSel]}>
                <Text style={[styles.skillText, sel && { color: "#fff" }]}>{pick(s, "name")}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>KYC Documents</Text>

        <View style={[styles.uploadBtn, aadhar && styles.uploadBtnDone]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => pickDoc(setAadhar)}>
            <Text style={[styles.uploadText, aadhar && { color: COLORS.green }]}>{aadhar ? aadhar.name : t.uploadAadhar}</Text>
          </TouchableOpacity>
          {aadhar && (
            <TouchableOpacity style={styles.removeBtn} onPress={() => setAadhar(null)}>
              <Text style={styles.removeBtnText}>x</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.uploadBtn, pan && styles.uploadBtnDone]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => pickDoc(setPan)}>
            <Text style={[styles.uploadText, pan && { color: COLORS.green }]}>{pan ? pan.name : t.uploadPAN}</Text>
          </TouchableOpacity>
          {pan && (
            <TouchableOpacity style={styles.removeBtn} onPress={() => setPan(null)}>
              <Text style={styles.removeBtnText}>x</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.limitText}>Allowed: PDF/JPG/PNG/WEBP, max {MAX_DOC_SIZE_MB} MB each</Text>
      </View>

      <Button title={t.submit} onPress={handleSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, gap: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  label: { fontSize: 11, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "#f9fafb" },
  skillChipSel: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  skillText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  uploadBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: "dashed" },
  uploadBtnDone: { borderColor: COLORS.green, borderStyle: "solid", backgroundColor: COLORS.greenLight },
  uploadText: { fontSize: 14, color: COLORS.textMuted, flex: 1 },
  removeBtn: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.border },
  removeBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.red, lineHeight: 16 },
  limitText: { fontSize: 12, color: COLORS.textDim },
});
