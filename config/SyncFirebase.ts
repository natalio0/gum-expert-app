import { auth } from "@/config/FirebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

/**
 * Sinkronisasi user Clerk ke Firebase Auth
 * Kalau OAuth (Google), password diganti UID Clerk sebagai dummy.
 */
export async function syncFirebaseAuth(email: string, passwordOrUID: string) {
  try {
    // Coba login ke Firebase
    await signInWithEmailAndPassword(auth, email, passwordOrUID);
    console.log("Login Firebase sukses ✅");
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      // Kalau user belum ada, buat akun baru di Firebase Auth
      await createUserWithEmailAndPassword(auth, email, passwordOrUID);
      console.log("User dibuat di Firebase ✅");
    } else {
      console.error("Gagal sinkron Firebase:", error);
    }
  }
}
