import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "@/context/AuthContext";
import { useUser } from "@clerk/clerk-expo";

const MenuItem = ({
  icon,
  image,
  bg,
  title,
  desc,
  onPress,
}: {
  icon: any;
  image: any;
  bg: string;
  title: string;
  desc: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.menuItem, { backgroundColor: bg }]}
    onPress={onPress}
  >
    <View style={styles.menuTextWrapper}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDesc}>{desc}</Text>
      </View>
    </View>
    <Image source={image} style={styles.menuImageRight} />
  </TouchableOpacity>
);

export default function HomePage() {
  const { isLoading, activeUser, userData } = useAuthContext();
  const router = useRouter();
  const { user } = useUser();

  // --- Redirect ke Login jika tidak ada user ---
  useEffect(() => {
    if (!isLoading && !activeUser) {
      router.replace("/(auth)/Login");
    }
  }, [isLoading, activeUser]);

  // --- Loading screen ---
  if (isLoading || !activeUser) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: "#6b7280" }}>
          Mengidentifikasi akun...
        </Text>
      </View>
    );
  }

  // --- Display name & email type-safe ---
  const displayName =
    userData?.name ||
    (activeUser.type === "firebase"
      ? activeUser.user.displayName
      : user?.fullName) ||
    "Pengguna";

  const displayEmail =
    userData?.email ||
    (activeUser.type === "firebase"
      ? activeUser.user.email
      : user?.primaryEmailAddress?.emailAddress) ||
    "Tidak Ada Email";

  const displayRole = userData?.role || "user";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.welcome}>Selamat datang 👋</Text>
            <Text style={styles.username}>{displayName}</Text>
            <Text style={styles.role}>Role: {displayRole}</Text>
          </View>

          <Text style={styles.sectionTitle}>Fitur Utama</Text>

          <MenuItem
            icon="medkit-outline"
            image={require("@/assets/images/pose_2.png")}
            bg="#3b82f6"
            title="Diagnosa"
            desc="Cek gejala gusi kamu"
            onPress={() => router.push("/(tabs)/Explore")}
          />
          <MenuItem
            icon="time-outline"
            image={require("@/assets/images/pose_4.png")}
            bg="#10b981"
            title="Riwayat"
            desc="Lihat hasil diagnosa"
            onPress={() => router.push("/(tabs)/History")}
          />
          <MenuItem
            icon="person-circle-outline"
            image={require("@/assets/images/pose_6.png")}
            bg="#8b5cf6"
            title="Profil"
            desc="Lihat & edit akunmu"
            onPress={() => router.push("/(tabs)/Profile")}
          />

          <Text style={styles.sectionTitle}>Tips Kesehatan Gusi 🦷</Text>

          {[
            {
              title: "Sikat gigi rutin",
              text: "Rajin sikat gigi minimal 2x sehari dengan pasta gigi berfluoride untuk menjaga kebersihan mulut.",
            },
            {
              title: "Hindari rokok 🚭",
              text: "Merokok dapat mempercepat kerusakan jaringan gusi dan meningkatkan risiko periodontitis.",
            },
            {
              title: "Periksa gigi rutin",
              text: "Lakukan scaling gigi setiap 6 bulan sekali agar plak dan karang gigi tidak menumpuk.",
            },
          ].map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <Text style={styles.tipTitle}>
                {i + 1}. {tip.title}
              </Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  container: { flex: 1, padding: 16 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  header: { marginBottom: 20 },
  welcome: { fontSize: 16, color: "#6b7280" },
  username: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4,
  },
  role: { fontSize: 14, color: "#9ca3af", marginTop: 2 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  menuTextWrapper: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuImageRight: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginLeft: 12,
  },
  menuTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  menuDesc: { color: "#e5e7eb", fontSize: 14, marginTop: 2 },
  tipCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#111827",
  },
  tipText: { fontSize: 14, color: "#4b5563", lineHeight: 20 },
});
