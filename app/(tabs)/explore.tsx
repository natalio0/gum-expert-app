import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { firestoreDb } from "@/config/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useAuthContext } from "@/context/AuthContext";
import { Rule, Gejala, GejalaList } from "@/types/data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = 30;
const ITEM_MARGIN = 20;
const CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const SNAP_INTERVAL = CARD_WIDTH + ITEM_MARGIN;
const INITIAL_SCROLL_OFFSET = HORIZONTAL_PADDING - ITEM_MARGIN / 2;

type GroupedGejala = {
  [key: string]: Gejala[];
};

const ChecklistItem = ({
  gejala,
  isSelected,
  onPress,
}: {
  gejala: Gejala;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.checkItem, isSelected && { borderColor: "#2563EB" }]}
    onPress={onPress}
  >
    <View style={[styles.checkCircle, isSelected && styles.checkedCircle]}>
      {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.checkTitle}>{gejala.id}</Text>
      <Text style={styles.checkDesc}>{gejala.desc}</Text>
    </View>
  </TouchableOpacity>
);

export default function DiagnosePage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuthContext();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGejala, setSelectedGejala] = useState<string[]>([]);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const groupedGejala = useMemo(() => {
    const groups: GroupedGejala = {};
    GejalaList.forEach((gejala) => {
      const category = gejala.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(gejala);
    });
    return groups;
  }, []);

  const categoryKeys = Object.keys(groupedGejala);
  const totalCategories = categoryKeys.length;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/(auth)/Login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Fetch rules from Firestore
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const rulesRef = collection(firestoreDb, "rules");
        const snapshot = await getDocs(rulesRef);
        const fetchedRules: Rule[] = [];
        snapshot.forEach((doc) => fetchedRules.push(doc.data() as Rule));
        setRules(fetchedRules);
      } catch (err) {
        console.error("Gagal ambil rules:", err);
        Alert.alert(
          "Error",
          "Gagal memuat data diagnosa. Cek koneksi atau konfigurasi Firebase."
        );
      } finally {
        setLoading(false);
      }
    };
    if (!isAuthLoading) fetchRules();
  }, [isAuthLoading]);

  const toggleGejala = (gejalaId: string) => {
    setSelectedGejala((prev) =>
      prev.includes(gejalaId)
        ? prev.filter((id) => id !== gejalaId)
        : [...prev, gejalaId]
    );
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(
      (contentOffsetX - INITIAL_SCROLL_OFFSET) / SNAP_INTERVAL
    );
    setActiveCategoryIndex(newIndex < 0 ? 0 : newIndex);
  };

  const navigateCategory = (direction: "next" | "prev") => {
    let newIndex = activeCategoryIndex;
    if (direction === "next" && activeCategoryIndex < totalCategories - 1) {
      newIndex++;
    } else if (direction === "prev" && activeCategoryIndex > 0) {
      newIndex--;
    }
    const scrollPosition = newIndex * SNAP_INTERVAL + INITIAL_SCROLL_OFFSET;
    scrollRef.current?.scrollTo({ x: scrollPosition, animated: true });
    setActiveCategoryIndex(newIndex);
  };

  useEffect(() => {
    if (scrollRef.current && !loading) {
      const timeout = setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: INITIAL_SCROLL_OFFSET,
          animated: false,
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  const runDiagnosis = () => {
    if (selectedGejala.length === 0) {
      Alert.alert(
        "Perhatian",
        "Pilih minimal satu gejala untuk memulai diagnosa."
      );
      return;
    }
    router.push({
      pathname: "/(tabs)/DiagnosisResult",
      params: { selectedGejalaIds: JSON.stringify(selectedGejala) },
    });
  };

  if (isAuthLoading || loading || !isAuthenticated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: "#2563EB" }}>
          Memuat aturan pakar...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.mainContainer}
          contentContainerStyle={styles.mainContentContainer}
        >
          <View style={styles.headerContent}>
            <Text style={styles.exploreHeadline}>
              Pilih Gejala yang Anda Rasakan
            </Text>
            <Text style={styles.exploreSubtext}>
              Geser untuk melihat kategori gejala lainnya. (
              {activeCategoryIndex + 1}/{totalCategories})
            </Text>
            <View style={styles.separator} />
          </View>

          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="start"
            decelerationRate="fast"
            style={styles.carouselWrapper}
            contentContainerStyle={styles.carouselContent}
          >
            {categoryKeys.map((categoryName, index) => (
              <View
                key={categoryName}
                style={[
                  styles.categoryContainer,
                  index === totalCategories - 1 && { marginRight: 0 },
                ]}
              >
                <Text style={styles.categoryTitle}>{categoryName}</Text>
                <Text style={styles.categorySubtitle}>
                  Pilih ({groupedGejala[categoryName].length}) gejala yang
                  relevan di bawah ini:
                </Text>
                <ScrollView style={styles.checklistScroll} nestedScrollEnabled>
                  {groupedGejala[categoryName].map((gejala) => (
                    <ChecklistItem
                      key={gejala.id}
                      gejala={gejala}
                      isSelected={selectedGejala.includes(gejala.id)}
                      onPress={() => toggleGejala(gejala.id)}
                    />
                  ))}
                  <View style={{ height: 10 }} />
                </ScrollView>
              </View>
            ))}
          </ScrollView>

          <View style={styles.navigationControl}>
            <TouchableOpacity
              onPress={() => navigateCategory("prev")}
              disabled={activeCategoryIndex === 0}
              style={[
                styles.navButton,
                activeCategoryIndex === 0 && styles.navDisabled,
              ]}
            >
              <Ionicons
                name="arrow-back-outline"
                size={24}
                color={activeCategoryIndex === 0 ? "#9ca3af" : "#2563EB"}
              />
            </TouchableOpacity>

            <View style={styles.indicatorContainer}>
              {categoryKeys.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    activeCategoryIndex === index && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={() => navigateCategory("next")}
              disabled={activeCategoryIndex === totalCategories - 1}
              style={[
                styles.navButton,
                activeCategoryIndex === totalCategories - 1 &&
                  styles.navDisabled,
              ]}
            >
              <Ionicons
                name="arrow-forward-outline"
                size={24}
                color={
                  activeCategoryIndex === totalCategories - 1
                    ? "#9ca3af"
                    : "#2563EB"
                }
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.diagnoseButton}
            onPress={runDiagnosis}
            disabled={selectedGejala.length === 0}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.diagnoseText}>Mulai Diagnosa</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  mainContainer: { flex: 1 },
  mainContentContainer: { paddingHorizontal: 16, paddingBottom: 30 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerContent: { marginBottom: 20 },
  exploreHeadline: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  exploreSubtext: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginTop: 12,
    borderRadius: 2,
  },
  carouselWrapper: { marginTop: 20 },
  carouselContent: {
    paddingLeft: INITIAL_SCROLL_OFFSET,
    paddingRight: INITIAL_SCROLL_OFFSET,
  },
  categoryContainer: { width: CARD_WIDTH, marginRight: ITEM_MARGIN },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  categorySubtitle: { fontSize: 14, color: "#6b7280", marginBottom: 12 },
  checklistScroll: { maxHeight: 400 },
  checkItem: {
    flexDirection: "row",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedCircle: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  checkTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  checkDesc: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  navigationControl: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  navButton: { padding: 8 },
  navDisabled: { opacity: 0.5 },
  indicatorContainer: { flexDirection: "row", alignItems: "center" },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d1d5db",
    marginHorizontal: 3,
  },
  indicatorActive: { backgroundColor: "#2563EB" },
  diagnoseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  diagnoseText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
