import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, RefreshControl, TextInput } from "react-native";
import { COLORS, RADIUS, SHADOW } from "../../constants/colors.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLang } from "../../context/LangContext.jsx";
import { getAllServices } from "../../services/api.js";
import { SOCKET_BASE } from "../../constants/api.js";
import { LangToggle } from "../../components/index.jsx";

const getImageUri = (image) => {
  if (!image) return null;
  return image.startsWith("http") ? image : `${SOCKET_BASE}${image}`;
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { t, toggle, pick } = useLang();
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  const load = () => {
    setLoading(true);
    getAllServices()
      .then(({ data }) => { setServices(data.services || []); setFiltered(data.services || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    if (!search) { setFiltered(services); return; }
    setFiltered(services.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nameNe?.includes(search)
    ));
  }, [search, services]);

  const imgUri = (s) => getImageUri(s.image);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accent} />}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.hello}>{t.hello}, {user?.name?.split(" ")[0] || "👋"}</Text>
          <Text style={styles.subHello}>{t.whatService}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </TouchableOpacity>
          <LangToggle label={t.switchLang} onPress={toggle} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          placeholderTextColor={COLORS.textDim}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>CareCrew सेवा</Text>
        <Text style={styles.bannerSub}>Trusted professionals at your doorstep</Text>
        <View style={styles.bannerBadge}><Text style={{ color: COLORS.accent, fontWeight: "700", fontSize: 12 }}>Nepal #1</Text></View>
      </View>

      {/* Services grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.allServices}</Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>{filtered.length} services</Text>
      </View>

      <View style={styles.grid}>
        {filtered.map((s) => (
          <TouchableOpacity
            key={s._id}
            style={styles.serviceCard}
            onPress={() => navigation.navigate("ServiceDetail", { service: s })}
            activeOpacity={0.85}
          >
            <View style={styles.serviceImgWrap}>
              {imgUri(s) ? (
                <Image source={{ uri: imgUri(s) }} style={styles.serviceImg} />
              ) : (
                <Text style={{ fontSize: 32 }}>🔧</Text>
              )}
            </View>
            <Text style={styles.serviceName} numberOfLines={2}>{pick(s, "name")}</Text>
            <Text style={styles.servicePrice}>{t.nrs} {s.price}</Text>
            <View style={styles.serviceDuration}>
              <Text style={{ fontSize: 10, color: COLORS.textMuted }}>⏱ {s.duration} {t.minutes}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  topBar:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 20, paddingTop: 56, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  hello:        { fontSize: 22, fontWeight: "800", color: COLORS.text },
  subHello:     { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  searchWrap:   { flexDirection: "row", alignItems: "center", margin: 16, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  searchIcon:   { fontSize: 16, marginRight: 8 },
  searchInput:  { flex: 1, paddingVertical: 12, fontSize: 14, color: COLORS.text },
  banner:       { marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.accent, borderRadius: RADIUS.xl, padding: 20, ...SHADOW.md },
  bannerTitle:  { color: "#fff", fontSize: 20, fontWeight: "800" },
  bannerSub:    { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 },
  bannerBadge:  { marginTop: 12, backgroundColor: "#fff", borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start" },
  sectionHeader:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: COLORS.text },
  grid:         { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 10 },
  serviceCard:  {
    width: "47%", backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: 14, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm, gap: 6,
  },
  serviceImgWrap:{ width: 52, height: 52, borderRadius: RADIUS.md, backgroundColor: COLORS.accentLight, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  serviceImg:   { width: 52, height: 52 },
  serviceName:  { fontSize: 13, fontWeight: "700", color: COLORS.text, lineHeight: 18 },
  servicePrice: { fontSize: 15, fontWeight: "800", color: COLORS.accent },
  serviceDuration: {},
});
