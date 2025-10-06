import {
  Platform,
  Image,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Colors from "@/shared/Colors";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { getAuth } from "firebase/auth";

WebBrowser.maybeCompleteAuthSession();

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function Index() {
  const router = useRouter();
  const { isSignedIn, user } = useUser(); // Clerk
  const [loading, setLoading] = useState(true);

  useWarmUpBrowser();

  useEffect(() => {
    const checkLogin = async () => {
      // Delay kecil agar efek loading terasa
      await new Promise((res) => setTimeout(res, 500));

      // Cek Clerk login
      if (isSignedIn && user) {
        router.replace("/(tabs)/Home"); // redirect ke halaman utama
        return;
      }

      // Cek Firebase login
      const auth = getAuth();
      if (auth.currentUser) {
        router.replace("/(tabs)/Home"); // redirect ke halaman utama
        return;
      }

      setLoading(false); // jika belum login, tampilkan tombol Get Started
    };

    checkLogin();
  }, [isSignedIn, user]);

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        paddingTop: Platform.OS === "android" ? 30 : 40,
      }}
    >
      <Image
        source={require("../assets/images/login.png")}
        style={{
          width: Dimensions.get("screen").width * 0.85,
          height: 280,
          resizeMode: "contain",
          marginTop: 100,
        }}
      />
      <View>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            textAlign: "center",
            marginTop: 15,
            marginBottom: 10,
            color: Colors.PRIMARY,
          }}
        >
          Welcome to DentalScope
        </Text>
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            marginBottom: 10,
            color: Colors.GRAY,
          }}
        >
          Your Solution for Gum Detections
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.PRIMARY}
          style={{ marginTop: 30 }}
        />
      ) : (
        <TouchableOpacity
          style={{
            width: "100%",
            padding: 20,
            backgroundColor: Colors.PRIMARY,
            borderRadius: 10,
            marginTop: 30,
          }}
          onPress={() => router.push("/(auth)/Login")}
        >
          <Text
            style={{
              color: Colors.WHITE,
              textAlign: "center",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Get Started
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
