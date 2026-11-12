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

interface AuthCtx {
  user: User | null;
  authLoading: boolean;
  /** Error from the last auth attempt, incl. Google redirect errors */
  authError: string | null;
  clearAuthError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  authLoading: true,
  authError: null,
  clearAuthError: () => {},
  signIn: async () => {},
  register: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  updateDisplayName: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  useEffect(() => {
    // Complete a Google redirect sign-in (if we just came back from Google).
    // Callbacks run async, so this is safe for render-loop lint rules.
    getRedirectResult(auth).catch((e: unknown) => {
      const code = (e as { code?: string })?.code ?? String(e);
      // User cancelling at Google is not an error worth showing.
      if (code === "auth/redirect-cancelled-by-user") return;
      setAuthError(authErrorMessage(code));
    });
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  // Popup first (most reliable where allowed — e.g. Firefox); fall back to
  // redirect only when popups are blocked/unsupported (e.g. Brave Shields).
  // User-cancelled or config errors are rethrown, never redirect-looped.
  const signInWithGoogle = useCallback(async () => {
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

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const updateDisplayName = useCallback(async (name: string) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName: name });
    // refresh local state so UI updates immediately
    setUser({ ...auth.currentUser } as User);
  }, []);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      authError,
      clearAuthError,
      signIn,
      register,
      signInWithGoogle,
      logout,
      updateDisplayName,
    }),
    [user, authLoading, authError, clearAuthError, signIn, register, signInWithGoogle, logout, updateDisplayName],
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
