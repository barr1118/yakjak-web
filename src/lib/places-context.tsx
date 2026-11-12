"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchPlacesFromFirestore,
  places as localPlaces,
} from "./places";
import type { Place } from "./types";

interface PlacesCtx {
  /** Firestore list when available, otherwise the local fallback. */
  allPlaces: Place[];
  source: "local" | "firestore";
  loading: boolean;
}

const Ctx = createContext<PlacesCtx>({
  allPlaces: localPlaces,
  source: "local",
  loading: true,
});

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [remote, setRemote] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPlacesFromFirestore().then(
      (list) => {
        if (cancelled) return;
        if (list.length > 0) setRemote(list);
        setLoading(false);
      },
      () => {
        if (!cancelled) setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<PlacesCtx>(
    () => ({
      allPlaces: remote ?? localPlaces,
      source: remote ? "firestore" : "local",
      loading,
    }),
    [remote, loading],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlaces() {
  return useContext(Ctx);
}
