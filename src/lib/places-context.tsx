"use client";

import { createContext, useContext, type ReactNode } from "react";
import { places as localPlaces } from "./places";
import type { Place } from "./types";

interface PlacesCtx {
  /** Curated local catalogue (the demo/deployment source of truth). */
  allPlaces: Place[];
  source: "local" | "firestore";
  loading: boolean;
}

const Ctx = createContext<PlacesCtx>({
  allPlaces: localPlaces,
  source: "local",
  loading: false,
});

/**
 * YakJak 2.0 keeps destinations in the curated local catalogue so the
 * verification badges, adat rules and safety notes are always consistent.
 * Firestore stays for per-user data (favorites, reviews, history).
 */
export function PlacesProvider({ children }: { children: ReactNode }) {
  return (
    <Ctx.Provider value={{ allPlaces: localPlaces, source: "local", loading: false }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePlaces() {
  return useContext(Ctx);
}
