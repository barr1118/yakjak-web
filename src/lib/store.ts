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

/**
 * Mirrors FirestoreService from yakjak_app/lib/services/firestore_service.dart:
 * users/{uid}/favorites/{placeName} -> { addedAt }
 */
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const ref = collection(db, "users", user.uid, "favorites");
    const unsub = onSnapshot(ref, (snap) => {
      setFavorites(new Set(snap.docs.map((d) => d.id)));
    });
    return () => {
      unsub();
      // clear stale favorites when switching accounts / logging out
      setFavorites(new Set());
    };
  }, [user]);

  const toggleFavorite = useCallback(
    async (placeName: string, isCurrentlyFavorite: boolean) => {
      if (!user) return;
      const ref = doc(db, "users", user.uid, "favorites", placeName);
      if (isCurrentlyFavorite) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { addedAt: serverTimestamp() });
      }
    },
    [user],
  );

  return { favorites, toggleFavorite };
}

// ---------------------------------------------------------------------------
// "Offline downloads" for web: the mobile app plans to download map tiles to
// local storage. On web we persist the place snapshot in localStorage instead.
// ---------------------------------------------------------------------------

const OFFLINE_KEY = "yakjak-offline";

function readOffline(): string[] {
  try {
    const raw = window.localStorage.getItem(OFFLINE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function useOfflineDownloads() {
  // Start empty to match SSR; hydrate from localStorage after mount.
  const [downloaded, setDownloaded] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDownloaded(readOffline());
    const onStorage = (e: StorageEvent) => {
      if (e.key === OFFLINE_KEY) setDownloaded(readOffline());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleDownload = useCallback((slug: string) => {
    const current = new Set(readOffline());
    if (current.has(slug)) {
      current.delete(slug);
    } else {
      current.add(slug);
    }
    const next = [...current];
    window.localStorage.setItem(OFFLINE_KEY, JSON.stringify(next));
    setDownloaded(next);
  }, []);

  return { downloaded, toggleDownload };
}
