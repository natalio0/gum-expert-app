import React, { useState } from "react";
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
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { firestoreDb } from "@/config/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Colors from "@/shared/Colors";

export default function RegisterScreen() {
  const { signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Register Manual (Firebase Auth) ---
  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return Alert.alert("Error", "Semua field wajib diisi");
    }
    if (password.length < 6)
      return Alert.alert("Error", "Password minimal 6 karakter");
    if (password !== confirmPassword)
      return Alert.alert("Error", "Password dan konfirmasi tidak sama");

    try {
      setLoading(true);
      const auth = getAuth();
      const fullName = `${firstName} ${lastName}`.trim();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      await setDoc(
        doc(firestoreDb, "users", user.uid),
        { email, name: fullName, joinDate: Date.now(), role: "user" },
        { merge: true }
      );

      router.replace("/(tabs)/Home");
    } catch (err: any) {
      console.error("Error signup:", err);
      let message = "Terjadi kesalahan saat registrasi";
      if (err.code === "auth/email-already-in-use")
        message = "Email sudah terdaftar.";
      else if (err.code === "auth/weak-password")
        message = "Password terlalu lemah (min 6 karakter)";
      Alert.alert("Registrasi Gagal", message);
    } finally {
      setLoading(false);
    }
  };

  // --- Register/Login dengan Google (Clerk OAuth) ---
  const handleGoogleRegister = async () => {
    try {
      const { createdSessionId, setActive, signUp } = await startOAuthFlow();
      if (!createdSessionId) return;

      await setActive!({ session: createdSessionId });

      const userId = signUp?.createdSessionId || signUp?.id || "";
      const userEmail = signUp?.emailAddress || "";
      const userFullName = `${signUp?.firstName ?? ""} ${
        signUp?.lastName ?? ""
      }`.trim();

      if (!userId)
        throw new Error("User ID tidak ditemukan setelah Google OAuth.");

      await setDoc(
        doc(firestoreDb, "users", userId),
        {
          email: userEmail,
          name: userFullName,
          joinDate: Date.now(),
          role: "user",
        },
        { merge: true }
      );

      router.replace("/(tabs)/Home");
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      Alert.alert("Error", err.message || "Login Google gagal");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DentalScope</Text>
      <Text style={styles.subtitle}>Sign Up</Text>

      {/* Form Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Nama Depan"
        value={firstName}
        onChangeText={setFirstName}
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Nama Belakang"
        value={lastName}
        onChangeText={setLastName}
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Konfirmasi Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor="#aaa"
      />

      {/* Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Daftar Manual</Text>
        )}
      </TouchableOpacity>

      <Text style={{ marginVertical: 10, color: "#555" }}>atau</Text>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleRegister}
      >
        <Image
          source={{
            uri: "https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png",
          }}
          style={styles.googleIcon}
        />
        <Text style={styles.googleButtonText}>Daftar dengan Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/Login")}>
        <Text style={styles.footerText}>
          Sudah punya akun? <Text style={styles.footerLink}>Sign In</Text>
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
    color: Colors.PRIMARY,
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
  footerLink: { color: Colors.PRIMARY, fontWeight: "600" },
});
