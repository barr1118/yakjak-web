"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import { demo, hydrateDemo, useDemoState } from "./demo-store";
import type { Role } from "./types";

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: Role;
  isDemo: boolean;
}

interface AuthCtx {
  user: AppUser | null;
  authLoading: boolean;
  isDemo: boolean;
  /** Error from the last auth attempt, incl. Google redirect errors */
  authError: string | null;
  clearAuthError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInDemo: (role: Role) => void;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  authLoading: true,
  isDemo: false,
  authError: null,
  clearAuthError: () => {},
  signIn: async () => {},
  register: async () => {},
  signInWithGoogle: async () => {},
  signInDemo: () => {},
  logout: async () => {},
  updateDisplayName: async () => {},
});

function fromFirebase(u: User): AppUser {
  return {
    uid: u.uid,
    displayName: u.displayName,
    email: u.email,
    photoURL: u.photoURL,
    role: "traveler",
    isDemo: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const demoState = useDemoState();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  useEffect(() => {
    hydrateDemo();
    // Complete a Google redirect sign-in (if we just came back from Google).
    getRedirectResult(auth).catch((e: unknown) => {
      const code = (e as { code?: string })?.code ?? String(e);
      if (code === "auth/redirect-cancelled-by-user") return;
      setAuthError(authErrorMessage(code));
    });
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setFirebaseLoading(false);
    });
    return () => unsub();
  }, []);

  const demoUser: AppUser | null = useMemo(
    () =>
      demoState.session
        ? {
            uid: demoState.session.uid,
            displayName: demoState.session.name,
            email: `${demoState.session.role}@demo.yakjak.local`,
            photoURL: null,
            role: demoState.session.role,
            isDemo: true,
          }
        : null,
    [demoState.session],
  );

  const user = useMemo(
    () => demoUser ?? (firebaseUser ? fromFirebase(firebaseUser) : null),
    [demoUser, firebaseUser],
  );
  const isDemo = Boolean(demoUser);

  const signIn = useCallback(async (email: string, password: string) => {
    demo.signOutDemo();
    setAuthError(null);
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    demo.signOutDemo();
    setAuthError(null);
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  // Popup first (most reliable where allowed — e.g. Firefox); fall back to
  // redirect only when popups are blocked/unsupported (e.g. Brave Shields).
  const signInWithGoogle = useCallback(async () => {
    demo.signOutDemo();
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? "";
      if (
        code === "auth/popup-blocked" ||
        code === "auth/operation-not-supported"
      ) {
        await signInWithRedirect(auth, provider);
      } else {
        throw e;
      }
    }
  }, []);

  const signInDemo = useCallback((role: Role) => {
    setAuthError(null);
    // Demo takes precedence; sign out any live Firebase session in background.
    void signOut(auth).catch(() => undefined);
    demo.signInDemo(role);
  }, []);

  const logout = useCallback(async () => {
    demo.signOutDemo();
    await signOut(auth).catch(() => undefined);
  }, []);

  const updateDisplayName = useCallback(
    async (name: string) => {
      if (demoUser) {
        demo.updateName(name);
        return;
      }
      if (!auth.currentUser) return;
      await updateProfile(auth.currentUser, { displayName: name });
      setFirebaseUser({ ...auth.currentUser } as User);
    },
    [demoUser],
  );

  const value = useMemo(
    () => ({
      user,
      authLoading: demoUser ? false : firebaseLoading,
      isDemo,
      authError,
      clearAuthError,
      signIn,
      register,
      signInWithGoogle,
      signInDemo,
      logout,
      updateDisplayName,
    }),
    [
      user,
      demoUser,
      isDemo,
      firebaseLoading,
      authError,
      clearAuthError,
      signIn,
      register,
      signInWithGoogle,
      signInDemo,
      logout,
      updateDisplayName,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}

/** Friendly message for common Firebase auth errors */
export function authErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Wrong email or password.";
    case "auth/email-already-in-use":
      return "Email is already registered. Please login instead.";
    case "auth/weak-password":
      return "Password is too weak (min. 6 characters).";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Browser blocked the login popup. Please allow popups for this site and try again.";
    case "auth/redirect-operation-pending":
      return "Login is still processing, please wait a moment.";
    case "auth/redirect-cancelled-by-user":
      return "Google sign-in was cancelled.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Auth settings.";
    default:
      return code;
  }
}
