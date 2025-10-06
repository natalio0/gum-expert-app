import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { firestoreDb } from "@/config/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export type Role = "user" | "admin";

export type UserData = {
  email: string;
  name: string;
  joinDate: { timestamp: number; year: number; month: number; day: number };
  lastLogin: number;
  role: Role;
};

type ActiveUser =
  | { type: "firebase"; user: FirebaseUser }
  | {
      type: "clerk";
      user: { id: string; email?: string | null; displayName?: string | null };
    };

type AuthContextType = {
  activeUser: ActiveUser | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  activeUser: null,
  userData: null,
  isAuthenticated: false,
  isLoading: true,
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen Firebase login
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (user) =>
      setFirebaseUser(user)
    );
    return () => unsub();
  }, []);

  // Set activeUser untuk Firebase
  useEffect(() => {
    if (firebaseUser) {
      setActiveUser((prev) =>
        !prev || prev.type !== "firebase" || prev.user.uid !== firebaseUser.uid
          ? { type: "firebase", user: firebaseUser }
          : prev
      );
    } else {
      setActiveUser((prev) => (prev?.type === "firebase" ? null : prev));
    }
  }, [firebaseUser]);

  // Fetch Firestore userData untuk Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!activeUser || activeUser.type !== "firebase") {
        setUserData(null);
        setIsLoading(false);
        return;
      }
      try {
        const docSnap = await getDoc(
          doc(firestoreDb, "users", activeUser.user.uid)
        );
        setUserData(docSnap.exists() ? (docSnap.data() as UserData) : null);
      } catch (err) {
        console.error("Gagal ambil userData:", err);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [activeUser]);

  return (
    <AuthContext.Provider
      value={{ activeUser, userData, isAuthenticated: !!activeUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
