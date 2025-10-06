import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { firestoreDb } from "@/config/FirebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useAuthContext } from "@/context/AuthContext";

type UserData = {
  email: string;
  name: string;
  joinDate: number;
  credits: number;
  role: "user" | "admin";
};

const ProfileItem = ({
  title,
  value,
  icon,
  color = "#111827",
}: {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}) => (
  <View style={styles.profileItem}>
    <Ionicons name={icon} size={24} color={color} style={styles.itemIcon} />
    <View style={styles.itemContent}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={[styles.itemValue, { color }]}>{value}</Text>
    </View>
  </View>
);

const FeatureItem = ({
  title,
  desc,
  icon,
  onPress,
}: {
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.featureItem} onPress={onPress}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={24} color="#2563EB" />
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
  </TouchableOpacity>
);

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { user } = useUser(); // Clerk user lengkap
  const { isLoading: loadingContext, activeUser, userData } = useAuthContext();
  const router = useRouter();

  const isLoading = loadingContext || (activeUser?.type === "clerk" && !user);

  // --- SIGN OUT ---
  const handleSignOut = async () => {
    try {
      if (activeUser?.type !== "firebase") {
        await signOut();
      }
      await getAuth().signOut();
      router.replace("/(auth)/Login");
    } catch (error) {
      Alert.alert("Error", "Gagal keluar. Coba lagi.");
      console.error("Sign Out Error:", error);
    }
  };

  // --- AMBIL USER ID SECARA TYPE-SAFE ---
  const getCurrentUserId = () => {
    if (!activeUser) return "guest";
    if (activeUser.type === "firebase") return activeUser.user.uid;
    if (activeUser.type === "clerk") return activeUser.user?.id || "guest";
    return "guest";
  };

  // --- SUBMIT SURVEY ---
  const confirmSubmission = async (rating: string, saran: string) => {
    const userId = getCurrentUserId();
    const data = { rating, saran, userId, timestamp: new Date().toISOString() };
    try {
      await addDoc(collection(firestoreDb, "app_surveys"), data);
      Alert.alert(
        "Terima Kasih!",
        `Rating: ${rating}\nSaran Anda telah berhasil kami terima.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Gagal mengirim survey:", error);
      Alert.alert("Gagal", "Gagal mengirim survey ke server. Coba lagi.");
    }
  };

  const askForRating = (saran: string) => {
    Alert.alert(
      "Survey: Rating Aplikasi",
      "Bagaimana rating Anda terhadap aplikasi ini (1-5 Bintang)?",
      [
        { text: "⭐", onPress: () => confirmSubmission("1 Bintang", saran) },
        { text: "⭐⭐", onPress: () => confirmSubmission("2 Bintang", saran) },
        {
          text: "⭐⭐⭐",
          onPress: () => confirmSubmission("3 Bintang", saran),
        },
        {
          text: "⭐⭐⭐⭐",
          onPress: () => confirmSubmission("4 Bintang", saran),
        },
        {
          text: "⭐⭐⭐⭐⭐",
          onPress: () => confirmSubmission("5 Bintang", saran),
        },
      ],
      { cancelable: true }
    );
  };

  const handleSurveyMenu = () => {
    if (!activeUser) {
      Alert.alert("Akses Ditolak", "Anda harus login untuk mengisi survey.");
      return;
    }
    Alert.prompt(
      "Survey: Saran Aplikasi",
      "Berikan saran Anda untuk aplikasi ini (opsional):",
      [
        {
          text: "Lewati",
          onPress: (s: any) => askForRating(s || "Tidak ada saran"),
          style: "cancel",
        },
        {
          text: "Kirim & Lanjut",
          onPress: (s: any) => askForRating(s || "Tidak ada saran"),
        },
      ],
      "plain-text"
    );
  };

  const handleSupport = () => {
    Alert.alert(
      "Pusat Bantuan & Dukungan",
      "Pilih tindakan yang ingin Anda lakukan:",
      [
        {
          text: "FAQ & Kontak Dukungan",
          onPress: () =>
            Alert.alert(
              "Dukungan",
              "Silakan cek FAQ atau hubungi kami di support@app.com"
            ),
        },
        { text: "Batal", style: "cancel" },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: "#6b7280" }}>
          Memuat profil...
        </Text>
      </View>
    );
  }

  // --- TAMPILKAN NAMA & EMAIL SECARA TYPE-SAFE ---
  let displayName = "Pengguna";
  let displayEmail = "Tidak Ada Email";

  if (activeUser) {
    if (activeUser.type === "firebase") {
      displayName = userData?.name || activeUser.user.displayName || "Pengguna";
      displayEmail =
        userData?.email || activeUser.user.email || "Tidak Ada Email";
    } else if (activeUser.type === "clerk") {
      displayName = userData?.name || user?.fullName || "Pengguna";
      displayEmail =
        userData?.email ||
        user?.primaryEmailAddress?.emailAddress ||
        "Tidak Ada Email";
    }
  }

  const displayRole = userData?.role || "user";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.profileHeader}>
            <Ionicons name="person-circle-outline" size={80} color="#2563EB" />
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.roleTag}>
              Role: {displayRole.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Detail Akun</Text>
          <View style={styles.detailContainer}>
            <ProfileItem
              icon="mail-outline"
              title="Email Utama"
              value={displayEmail}
              color="#4b5563"
            />
          </View>

          <Text style={styles.sectionTitle}>Fitur</Text>
          <View style={styles.detailContainer}>
            <FeatureItem
              icon="list-outline"
              title="Riwayat Diagnosa"
              desc="Lihat semua hasil pemeriksaan gusi Anda"
              onPress={() => router.push("/(tabs)/History")}
            />
            <FeatureItem
              icon="star-outline"
              title="Isi Survey Aplikasi"
              desc="Beri rating dan saran untuk aplikasi kami"
              onPress={handleSurveyMenu}
            />
            <FeatureItem
              icon="help-circle-outline"
              title="Bantuan & Dukungan"
              desc="Hubungi kami atau lihat FAQ aplikasi"
              onPress={handleSupport}
            />
          </View>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.signOutText}>Keluar (Sign Out)</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
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
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },
  displayName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 10,
  },
  roleTag: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 15,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginVertical: 10,
  },
  detailContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemIcon: { width: 30 },
  itemContent: { flex: 1, marginLeft: 10 },
  itemTitle: { fontSize: 12, color: "#9ca3af", fontWeight: "600" },
  itemValue: { fontSize: 16, fontWeight: "600", marginTop: 2 },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  featureIconContainer: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: { flex: 1, marginLeft: 10 },
  featureTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  featureDesc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  signOutButton: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#ef4444",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  signOutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
