import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export interface HistoryEntry {
  id: string;
  placeSlug: string;
  placeName: string;
  completedAt: Date | null;
  distanceKm?: number | null;
  durationMin?: number | null;
}

/**
 * Completed expeditions. Stored at users/{uid}/history (see firestore.rules).
 * Referenced by placeSlug so entries survive catalog changes.
 */
export function subscribeHistory(
  uid: string,
  onUpdate: (entries: HistoryEntry[]) => void,
): Unsubscribe {
  const ref = collection(db, "users", uid, "history");
  return onSnapshot(
    ref,
    (snap) => {
      const list: HistoryEntry[] = snap.docs.map((d) => {
        const v = d.data() as Record<string, unknown>;
        const ts = v.completedAt as { toDate?: () => Date } | null;
        const dist = Number(v.distanceKm);
        const dur = Number(v.durationMin);
        return {
          id: d.id,
          placeSlug: String(v.placeSlug ?? ""),
          placeName: String(v.placeName ?? v.placeSlug ?? "?"),
          completedAt:
            ts && typeof ts.toDate === "function" ? ts.toDate() : null,
          distanceKm: Number.isFinite(dist) ? dist : null,
          durationMin: Number.isFinite(dur) ? dur : null,
        };
      });
      // Newest first (client-side to avoid index requirements).
      list.sort(
        (a, b) =>
          (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
      );
      onUpdate(list);
    },
    () => onUpdate([]),
  );
}

export async function addHistory(
  uid: string,
  input: {
    placeSlug: string;
    placeName: string;
    distanceKm?: number;
    durationMin?: number;
    track?: { lat: number; lng: number }[];
  },
): Promise<void> {
  await addDoc(collection(db, "users", uid, "history"), {
    placeSlug: input.placeSlug,
    placeName: input.placeName,
    completedAt: serverTimestamp(),
    ...(input.distanceKm != null ? { distanceKm: input.distanceKm } : {}),
    ...(input.durationMin != null ? { durationMin: input.durationMin } : {}),
    ...(input.track && input.track.length > 0 ? { track: input.track } : {}),
  });
}

export async function deleteHistory(
  uid: string,
  entryId: string,
): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "history", entryId));
}
