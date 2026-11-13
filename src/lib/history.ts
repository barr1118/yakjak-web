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
import { demo, getDemoState, subscribeDemo } from "./demo-store";

export interface HistoryEntry {
  id: string;
  placeSlug: string;
  placeName: string;
  completedAt: Date | null;
  distanceKm?: number | null;
  durationMin?: number | null;
}

function demoHistory(uid: string): HistoryEntry[] {
  return getDemoState()
    .trips.filter((t) => t.userUid === uid)
    .map((t) => ({
      id: t.id,
      placeSlug: t.placeSlug,
      placeName: t.placeName,
      completedAt: new Date(t.completedAt),
      distanceKm: t.distanceKm,
      durationMin: t.durationMin,
    }))
    .sort(
      (a, b) =>
        (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
    );
}

/**
 * Completed expeditions. Firestore for real accounts, demo store for the
 * walkthrough accounts used by the lecturer/reviewer.
 */
export function subscribeHistory(
  uid: string,
  onUpdate: (entries: HistoryEntry[]) => void,
): Unsubscribe {
  if (uid.startsWith("demo-")) {
    const push = () => onUpdate(demoHistory(uid));
    push();
    return subscribeDemo(push);
  }

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
  if (uid.startsWith("demo-")) {
    demo.addTrip({
      userUid: uid,
      placeSlug: input.placeSlug,
      placeName: input.placeName,
      distanceKm: input.distanceKm ?? 0,
      durationMin: input.durationMin ?? 0,
      track: (input.track ?? []).map((p) => [p.lat, p.lng] as [number, number]),
    });
    return;
  }

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
  if (uid.startsWith("demo-")) {
    demo.deleteTrip(entryId);
    return;
  }
  await deleteDoc(doc(db, "users", uid, "history", entryId));
}
