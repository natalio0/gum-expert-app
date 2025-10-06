import React, { useEffect, useState, useCallback } from "react";
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
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { firestoreDb } from "@/config/FirebaseConfig";
import {
  collection,
  query,
  getDocs,
  orderBy,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/context/AuthContext";

type HistoryRecord = {
  id: string;
  diagnosisName: string;
  accuracy: number;
  isSuccess: boolean;
  perawatan: string[];
  timestamp: string;
  userId: string;
};

const HistoryCard = ({ record }: { record: HistoryRecord }) => {
  const isSuccess = record.isSuccess;
  const iconName = isSuccess
    ? "shield-checkmark-outline"
    : record.accuracy > 0
    ? "information-circle-outline"
    : "warning-outline";
  const iconColor = isSuccess
    ? "#10b981"
    : record.accuracy > 0
    ? "#f59e0b"
    : "#ef4444";
  const cardBg = isSuccess
    ? "#ecfdf5"
    : record.accuracy > 0
    ? "#fffbeb"
    : "#fee2e2";
  const titleColor = isSuccess
    ? "#065f46"
    : record.accuracy > 0
    ? "#92400e"
    : "#b91c1c";

  const date = new Date(record.timestamp);
  const formattedDate =
    date instanceof Date && !isNaN(date.getTime())
      ? date.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Tanggal tidak valid";

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={styles.cardHeader}>
        <Ionicons name={iconName} size={28} color={iconColor} />
        <View style={styles.headerText}>
          <Text style={styles.cardDate}>{formattedDate}</Text>
          <Text
            style={[styles.cardTitle, { color: titleColor }]}
            numberOfLines={1}
          >
            {record.diagnosisName}
          </Text>
        </View>
        <Text style={[styles.accuracyTag, { backgroundColor: iconColor }]}>
          {record.accuracy.toFixed(0)}%
        </Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.perawatanLabel}>Rekomendasi Utama:</Text>
        <Text style={styles.perawatanText} numberOfLines={1}>
          {record.perawatan[0] || "Tidak ada rekomendasi spesifik."}
        </Text>
      </View>
    </View>
  );
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const {
    isLoading: isAuthLoading,
    activeUser,
    isAuthenticated,
  } = useAuthContext();
  let currentUserId = "guest_session_user";

  if (activeUser) {
    if (activeUser.type === "firebase") {
      currentUserId = activeUser.user.uid;
    } else if (activeUser.type === "clerk") {
      currentUserId = activeUser.user?.id || "guest_session_user";
    }
  }

  // --- NAVIGASI JIKA TIDAK LOGIN ---
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/(auth)/Login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // --- LISTEN REALTIME HISTORY ---
  useEffect(() => {
    if (isAuthLoading || !currentUserId) return;
    setLoading(true);

    const historyQuery = query(
      collection(firestoreDb, "diagnose_history"),
      where("userId", "==", currentUserId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        const fetchedHistory: HistoryRecord[] = [];
        snapshot.forEach((doc) => {
          fetchedHistory.push({ id: doc.id, ...doc.data() } as HistoryRecord);
        });
        setHistory(fetchedHistory);
        setLoading(false);
      },
      (error) => {
        console.error("Gagal mendengarkan riwayat:", error);
        Alert.alert(
          "Error Database",
          "Gagal memuat riwayat secara real-time. Pastikan Indeks Firestore sudah dibuat."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId, isAuthLoading]);

  const manualFetchHistory = useCallback(async () => {
    if (isAuthLoading || !currentUserId) return;
    setLoading(true);
    try {
      const historyQuery = query(
        collection(firestoreDb, "diagnose_history"),
        where("userId", "==", currentUserId),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(historyQuery);
      const fetchedHistory: HistoryRecord[] = [];
      snapshot.forEach((doc) => {
        fetchedHistory.push({ id: doc.id, ...doc.data() } as HistoryRecord);
      });
      setHistory(fetchedHistory);
    } catch (err) {
      console.error("Gagal force refresh riwayat:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, isAuthLoading]);

  if (isAuthLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: "#6b7280" }}>
          Memuat riwayat...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeaderContainer}>
            <View style={styles.headerTitleArea}>
              <Text style={styles.pageTitle}>Riwayat Anda</Text>
              <Text style={styles.pageSubtitle}>
                Total {history.length} diagnosis tersimpan.
              </Text>
            </View>
            <TouchableOpacity
              onPress={manualFetchHistory}
              disabled={loading}
              style={styles.refreshButton}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <Ionicons name="refresh-outline" size={26} color="#2563EB" />
              )}
            </TouchableOpacity>
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="archive-outline" size={60} color="#9ca3af" />
              <Text style={styles.emptyText}>
                Belum ada riwayat diagnosis tersimpan.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/Explore")}
                style={styles.diagnoseButton}
              >
                <Text style={styles.diagnoseButtonText}>
                  Mulai Diagnosa Sekarang
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            history.map((record) => (
              <HistoryCard key={record.id} record={record} />
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  container: { padding: 16, flexGrow: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  pageHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitleArea: { flex: 1, marginRight: 15 },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  pageSubtitle: { fontSize: 16, color: "#6b7280", lineHeight: 20 },
  refreshButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: "#e0f2fe",
    alignSelf: "center",
  },
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  headerText: { flex: 1, marginLeft: 10 },
  cardDate: { fontSize: 12, color: "#6b7280" },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginTop: 2 },
  accuracyTag: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
    minWidth: 50,
    textAlign: "center",
  },
  cardBody: {
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  perawatanLabel: { fontSize: 12, color: "#4b5563", fontWeight: "600" },
  perawatanText: { fontSize: 14, color: "#1f2937", marginTop: 2 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#9ca3af",
    marginTop: 15,
    textAlign: "center",
  },
  diagnoseButton: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  diagnoseButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
