"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./auth";
import { demo, useDemoState } from "./demo-store";

/**
 * Favorites: Firestore for real accounts, demo store for demo accounts.
 * Keep the same signature used across the app.
 */
export function useFavorites() {
  const { user } = useAuth();
  const demoState = useDemoState();
  const [remote, setRemote] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user || user.isDemo) return;
    const ref = collection(db, "users", user.uid, "favorites");
    const unsub = onSnapshot(ref, (snap) => {
      setRemote(new Set(snap.docs.map((d) => d.id)));
    });
    return () => {
      unsub();
      setRemote(new Set());
    };
  }, [user]);

  const toggleFavorite = useCallback(
    async (placeName: string, isCurrentlyFavorite: boolean) => {
      if (!user) return;
      if (user.isDemo) {
        demo.toggleFavorite(placeName);
        return;
      }
      const ref = doc(db, "users", user.uid, "favorites", placeName);
      if (isCurrentlyFavorite) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { addedAt: serverTimestamp() });
      }
    },
    [user],
  );

  const favorites = user?.isDemo
    ? new Set(demoState.favorites)
    : remote;

  return { favorites, toggleFavorite };
}

/**
 * Offline Trip Packs. The pack metadata lives in the demo store and is shared
 * by guests, demo users and real accounts; the bytes are cached by the
 * download helper in lib/trip-pack.ts.
 */
export function useOfflineDownloads() {
  const demoState = useDemoState();
  const toggleDownload = useCallback((slug: string) => {
    demo.togglePack(slug);
  }, []);
  return { downloaded: demoState.packs, toggleDownload };
}
