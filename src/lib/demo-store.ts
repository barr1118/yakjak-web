"use client";

import { useSyncExternalStore } from "react";
import type {
  Booking,
  BookingStatus,
  DemoState,
  Provider,
  Review,
  Role,
  TrailCondition,
  TrailReport,
  Trip,
} from "./types";
import { offerings, providers, seedState } from "./seed";

const STORAGE_KEY = "yakjak-demo-v2";

let state: DemoState = seedState;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

function persist() {
  if (!hydrated || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full/unavailable — demo keeps working in memory */
  }
}

function setState(updater: (prev: DemoState) => DemoState) {
  state = updater(state);
  persist();
  emit();
}

function normalize(raw: unknown): DemoState {
  if (!raw || typeof raw !== "object") return seedState;
  const v = raw as Partial<DemoState>;
  return {
    session: v.session ?? null,
    favorites: Array.isArray(v.favorites) ? v.favorites : seedState.favorites,
    bookings: Array.isArray(v.bookings) ? v.bookings : seedState.bookings,
    trips: Array.isArray(v.trips) ? v.trips : seedState.trips,
    reviews: Array.isArray(v.reviews) ? v.reviews : seedState.reviews,
    trailReports: Array.isArray(v.trailReports)
      ? v.trailReports
      : seedState.trailReports,
    packs: Array.isArray(v.packs) ? v.packs : [],
    providerVerified:
      v.providerVerified && typeof v.providerVerified === "object"
        ? v.providerVerified
        : {},
  };
}

/** Load persisted demo state. Safe to call more than once. */
export function hydrateDemo() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) state = normalize(JSON.parse(raw));
  } catch {
    state = seedState;
  }
  emit();
}

export function getDemoState(): DemoState {
  return state;
}

function getServerSnapshot(): DemoState {
  return seedState;
}

export function subscribeDemo(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribeDemo, getDemoState, getServerSnapshot);
}

export function resetDemo() {
  state = { ...seedState, session: state.session };
  persist();
  emit();
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

function uidForRole(role: Role): string {
  if (role === "provider") return "demo-provider";
  if (role === "admin") return "demo-admin";
  return "demo-traveler";
}

function nameForRole(role: Role): string {
  if (role === "provider") return "Sulaiman (provider demo)";
  if (role === "admin") return "Admin YakJak (demo)";
  return "Rizky (traveler demo)";
}

export const demo = {
  signInDemo(role: Role) {
    setState((prev) => ({
      ...prev,
      session: {
        uid: uidForRole(role),
        name: nameForRole(role),
        role,
      },
    }));
  },

  signOutDemo() {
    setState((prev) => ({ ...prev, session: null }));
  },

  updateName(name: string) {
    setState((prev) =>
      prev.session ? { ...prev, session: { ...prev.session, name } } : prev,
    );
  },

  toggleFavorite(name: string) {
    setState((prev) => {
      const has = prev.favorites.includes(name);
      return {
        ...prev,
        favorites: has
          ? prev.favorites.filter((f) => f !== name)
          : [...prev.favorites, name],
      };
    });
  },

  addBooking(input: {
    travelerUid: string;
    travelerName: string;
    providerId: string;
    offeringId: string;
    destinationSlug: string;
    date: string;
    pax: number;
    notes: string;
    contact: string;
    totalPrice?: number;
  }): Booking {
    const offering = offerings.find((o) => o.id === input.offeringId);
    const booking: Booking = {
      id: `bk-${Date.now()}`,
      ...input,
      status: "requested",
      totalPrice:
        input.totalPrice ?? (offering?.price ?? 0) * input.pax,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, bookings: [booking, ...prev.bookings] }));
    return booking;
  },

  updateBookingStatus(
    id: string,
    status: BookingStatus,
    providerNote?: string,
  ) {
    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === id
          ? { ...b, status, ...(providerNote ? { providerNote } : {}) }
          : b,
      ),
    }));
  },

  addTrip(input: {
    userUid: string;
    placeSlug: string;
    placeName: string;
    distanceKm: number;
    durationMin: number;
    track: [number, number][];
  }): Trip {
    const trip: Trip = {
      id: `trip-${Date.now()}`,
      userUid: input.userUid,
      placeSlug: input.placeSlug,
      placeName: input.placeName,
      startedAt: new Date(Date.now() - input.durationMin * 60000).toISOString(),
      completedAt: new Date().toISOString(),
      distanceKm: input.distanceKm,
      durationMin: input.durationMin,
      track: input.track,
    };
    setState((prev) => ({ ...prev, trips: [trip, ...prev.trips] }));
    return trip;
  },

  deleteTrip(id: string) {
    setState((prev) => ({
      ...prev,
      trips: prev.trips.filter((t) => t.id !== id),
    }));
  },

  addReview(input: {
    placeSlug: string;
    userId: string;
    userName: string;
    rating: number;
    text: string;
  }): Review {
    const review: Review = {
      id: `rev-${Date.now()}`,
      placeSlug: input.placeSlug,
      userId: input.userId,
      userName: input.userName,
      rating: Math.min(5, Math.max(1, Math.round(input.rating))),
      text: input.text.trim().slice(0, 500),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, reviews: [review, ...prev.reviews] }));
    return review;
  },

  deleteReview(id: string) {
    setState((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((r) => r.id !== id),
    }));
  },

  addTrailReport(input: {
    placeSlug: string;
    userId: string;
    userName: string;
    condition: TrailCondition;
    notes: string;
  }): TrailReport {
    const report: TrailReport = {
      id: `tr-${Date.now()}`,
      ...input,
      notes: input.notes.trim().slice(0, 500),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      trailReports: [report, ...prev.trailReports],
    }));
    return report;
  },

  togglePack(slug: string) {
    setState((prev) => ({
      ...prev,
      packs: prev.packs.includes(slug)
        ? prev.packs.filter((s) => s !== slug)
        : [...prev.packs, slug],
    }));
  },

  verifyProvider(id: string, verified: boolean) {
    setState((prev) => ({
      ...prev,
      providerVerified: { ...prev.providerVerified, [id]: verified },
    }));
  },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function isProviderVerified(
  provider: Provider,
  overrides: Record<string, boolean>,
): boolean {
  return overrides[provider.id] ?? provider.verified;
}

export function getProviderById(id: string): Provider | undefined {
  return providers.find((p) => p.id === id);
}

export function getOfferingById(id: string) {
  return offerings.find((o) => o.id === id);
}

export function getOfferingsForProvider(providerId: string) {
  return offerings.filter((o) => o.providerId === providerId);
}

export function getOfferingsForPlace(placeSlug: string) {
  return offerings.filter((o) => o.destinationSlug === placeSlug);
}

export function getProvidersForPlace(
  placeSlug: string,
  overrides: Record<string, boolean> = {},
) {
  return providers.filter(
    (p) =>
      p.destinationSlugs.includes(placeSlug) &&
      isProviderVerified(p, overrides),
  );
}

export function getBookingsForTraveler(uid: string, bookings: Booking[]) {
  return bookings.filter((b) => b.travelerUid === uid);
}

export function getBookingsForProvider(providerId: string, bookings: Booking[]) {
  return bookings.filter((b) => b.providerId === providerId);
}

export function getProviderForOwner(uid: string): Provider | undefined {
  return providers.find((p) => p.ownerUid === uid);
}
