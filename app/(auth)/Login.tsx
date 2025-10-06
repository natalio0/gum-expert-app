import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { useOAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { firestoreDb } from "@/config/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Colors from "@/shared/Colors";
import { useAuthContext } from "@/context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { user } = useUser(); // pastikan screen dibungkus ClerkProvider
  const { activeUser, isLoading } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Redirect otomatis ke Home jika sudah login ---
  useEffect(() => {
    if (!isLoading && activeUser) {
      router.replace("/(tabs)/Home");
    }
  }, [activeUser, isLoading]);

  // --- Login manual (Firebase) ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi");
      return;
    }
    try {
      setLoading(true);
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const loggedInUser = userCredential.user;

      await setDoc(
        doc(firestoreDb, "users", loggedInUser.uid),
        { email, lastLogin: Date.now(), role: "user" },
        { merge: true }
      );

      Alert.alert("Sukses", "Login berhasil!");
    } catch (err: any) {
      console.error("Error login:", err);
      let msg = "Terjadi kesalahan saat login.";
      if (err.code === "auth/invalid-email") msg = "Email tidak valid.";
      else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      )
        msg = "Kombinasi email/password salah.";
      Alert.alert("Login Gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Login Google (Clerk) ---
  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });

        if (user) {
          // simpan data ke Firestore jika perlu
          await setDoc(
            doc(firestoreDb, "users", user.id),
            {
              email: user.primaryEmailAddress?.emailAddress ?? "",
              name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
              lastLogin: Date.now(),
              role: "user",
            },
            { merge: true }
          );
        }

        Alert.alert("Sukses", "Login dengan Google berhasil!");
      }
    } catch (err: any) {
      console.error("Google Login error:", err);
      Alert.alert("Error", err.message || "Login Google gagal");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DentalScope</Text>
      <Text style={styles.subtitle}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login Manual</Text>
        )}
      </TouchableOpacity>

      <Text style={{ marginVertical: 10, color: "#555" }}>atau</Text>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Image
          source={{
            uri: "https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png",
          }}
          style={styles.googleIcon}
        />
        <Text style={styles.googleButtonText}>Login dengan Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/SignUp")}>
        <Text style={styles.footerText}>
          Belum punya akun? <Text style={styles.footerLink}>Daftar</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    fontSize: 16,
    color: "#000",
  },
  button: {
    width: "100%",
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleButtonText: { color: "#000", fontSize: 16, fontWeight: "600" },
  footerText: { color: "#555", fontSize: 14 },
  footerLink: { color: "#2563eb", fontWeight: "600" },
});
