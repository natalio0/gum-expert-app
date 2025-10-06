import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { firestoreDb } from "@/config/FirebaseConfig";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { Rule } from "@/types/data";
import { useAuthContext } from "@/context/AuthContext";

type DiagnosisResultState = {
  diagnosisName: string;
  perawatanDesc: string[];
  isSuccess: boolean;
  accuracy: number;
};

export default function DiagnosisResult() {
  const params = useLocalSearchParams();
  const { selectedGejalaIds } = params;
  const router = useRouter();
  const { activeUser, isLoading: isAuthLoading } = useAuthContext();

  // Aman untuk union type Firebase | Clerk
  const currentUserId = (() => {
    if (activeUser?.type === "firebase" && activeUser.user)
      return activeUser.user.uid;
    if (activeUser?.type === "clerk" && activeUser.user)
      return activeUser.user.id;
    return "guest_default";
  })();

  const [result, setResult] = useState<DiagnosisResultState | null>(null);
  const [loading, setLoading] = useState(true);

  const runForwardChaining = async (selectedIds: string[]) => {
    try {
      const snapshot = await getDocs(collection(firestoreDb, "rules"));
      const rules: Rule[] = snapshot.docs.map((doc) => doc.data() as Rule);

      let bestMatch: { rule: Rule; percentage: number } | null = null;
      let highestPercentage = 0;

      for (const rule of rules) {
        const matchedCount = rule.gejala.filter((id) =>
          selectedIds.includes(id)
        ).length;
        const percentage = rule.gejala.length
          ? (matchedCount / rule.gejala.length) * 100
          : 0;
        if (percentage > highestPercentage) {
          highestPercentage = percentage;
          bestMatch = { rule, percentage };
        }
      }

      if (bestMatch && bestMatch.percentage > 0) {
        setResult({
          diagnosisName: bestMatch.rule.diagnosis_name,
          perawatanDesc: bestMatch.rule.perawatan_desc,
          isSuccess: bestMatch.percentage >= 60,
          accuracy: bestMatch.percentage,
        });
      } else {
        setResult({
          diagnosisName: "Diagnosis Tidak Ditemukan",
          perawatanDesc: [
            "Gejala yang Anda pilih tidak cocok dengan aturan pakar. Silakan periksa kembali pilihan Anda atau konsultasi ke dokter gigi.",
          ],
          isSuccess: false,
          accuracy: 0,
        });
      }
    } catch (err) {
      console.error("Gagal menjalankan diagnosis:", err);
      Alert.alert("Error", "Gagal memproses diagnosis. Cek koneksi.");
      setResult({
        diagnosisName: "Error Pemrosesan",
        perawatanDesc: ["Terjadi kesalahan saat memuat data dari server."],
        isSuccess: false,
        accuracy: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;

    let selectedIds: string[] = [];
    if (typeof selectedGejalaIds === "string") {
      try {
        selectedIds = JSON.parse(selectedGejalaIds);
      } catch (e) {
        console.error("Gagal parse gejala ID:", e);
        Alert.alert("Error", "Data gejala tidak valid.");
        setLoading(false);
        return;
      }
    }
    runForwardChaining(selectedIds);
  }, [selectedGejalaIds, isAuthLoading]);

  const handleFinishDiagnosis = async () => {
    if (!result || isAuthLoading) {
      Alert.alert(
        "Gagal",
        "Sistem masih memproses atau ID pengguna belum tersedia."
      );
      return;
    }
    try {
      await addDoc(collection(firestoreDb, "diagnose_history"), {
        diagnosisName: result.diagnosisName,
        accuracy: parseFloat(result.accuracy.toFixed(0)),
        isSuccess: result.isSuccess,
        perawatan: result.perawatanDesc,
        selectedIds: JSON.parse(selectedGejalaIds as string),
        userId: currentUserId,
        timestamp: new Date().toISOString(),
      });
      router.replace("/(tabs)/History");
    } catch (e) {
      console.error("Gagal menyimpan riwayat:", e);
      Alert.alert(
        "Peringatan",
        "Gagal menyimpan riwayat. Anda akan diarahkan ke Riwayat."
      );
      router.replace("/(tabs)/History");
    }
  };

  if (loading || isAuthLoading || !result) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: "#2563EB" }}>
          Menganalisis gejala...
        </Text>
      </View>
    );
  }

  const { diagnosisName, perawatanDesc, isSuccess, accuracy } = result;
  const iconName = isSuccess
    ? "shield-checkmark-outline"
    : accuracy > 0
    ? "information-circle-outline"
    : "warning-outline";
  const iconColor = isSuccess
    ? "#10b981"
    : accuracy > 0
    ? "#f59e0b"
    : "#ef4444";
  const cardBg = isSuccess ? "#ecfdf5" : accuracy > 0 ? "#fffbeb" : "#fee2e2";
  const titleColor = isSuccess
    ? "#065f46"
    : accuracy > 0
    ? "#92400e"
    : "#b91c1c";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Hasil Diagnosa Gusi</Text>
            <Text style={styles.pageSubtitle}>
              Ditemukan diagnosis dengan tingkat kecocokan tertinggi berdasarkan
              gejala Anda.
            </Text>
          </View>

          <View style={[styles.resultCard, { backgroundColor: cardBg }]}>
            <Ionicons name={iconName} size={48} color={iconColor} />
            <Text style={[styles.resultTitle, { color: titleColor }]}>
              {accuracy > 0 ? "Diagnosis Paling Akurat" : "Pemberitahuan"}
            </Text>
            <Text style={styles.diagnosisName}>{diagnosisName}</Text>

            <View style={styles.accuracyBox}>
              <Text style={styles.accuracyLabel}>Tingkat Kecocokan:</Text>
              <Text style={[styles.accuracyValue, { color: iconColor }]}>
                {accuracy.toFixed(0)}%
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Rekomendasi Penanganan Awal</Text>
          <View style={styles.perawatanList}>
            {perawatanDesc.map((item, index) => (
              <View key={index} style={styles.perawatanItem}>
                <View style={styles.dot} />
                <Text style={styles.perawatanText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>Penting!</Text>
            <Text style={styles.disclaimerText}>
              Hasil ini adalah prediksi berdasarkan sistem pakar dan tingkat
              kecocokan (<Text style={{ fontWeight: "bold" }}>Precision</Text>).
              Selalu konsultasikan dengan{" "}
              <Text style={{ fontWeight: "bold" }}>dokter gigi</Text>{" "}
              profesional untuk pemeriksaan akurat.
            </Text>
          </View>

          <View style={{ height: 30 }} />

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleFinishDiagnosis}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Selesai & Simpan Riwayat</Text>
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
  pageHeader: { marginBottom: 20 },
  pageTitle: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  pageSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    marginTop: 20,
  },
  resultCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  resultTitle: { fontSize: 18, fontWeight: "600", marginTop: 10 },
  diagnosisName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  accuracyBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginTop: 10,
  },
  accuracyLabel: { fontSize: 16, color: "#4b5563", marginRight: 8 },
  accuracyValue: { fontSize: 18, fontWeight: "700" },
  perawatanList: { paddingHorizontal: 8 },
  perawatanItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
    marginTop: 8,
    marginRight: 8,
  },
  perawatanText: { flex: 1, fontSize: 16, color: "#4b5563", lineHeight: 22 },
  disclaimerCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fffbeb",
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 6,
  },
  disclaimerText: { fontSize: 14, color: "#92400e", lineHeight: 20 },
  backButton: {
    flexDirection: "row",
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
