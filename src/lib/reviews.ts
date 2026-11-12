import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Review {
  id: string;
  placeSlug: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: Date | null;
}

/**
 * Community reviews. Collection `reviews` is world-readable; each doc is
 * writable only by its author (see firestore.rules). Documents reference
 * destinations via `placeSlug` so they survive catalog changes.
 */
export function subscribeReviews(
  placeSlug: string,
  onUpdate: (reviews: Review[]) => void,
): Unsubscribe {
  const q = query(collection(db, "reviews"), where("placeSlug", "==", placeSlug));
  return onSnapshot(
    q,
    (snap) => {
      const list: Review[] = snap.docs.map((d) => {
        const v = d.data() as Record<string, unknown>;
        const ts = v.createdAt as { toDate?: () => Date } | null;
        return {
          id: d.id,
          placeSlug,
          userId: String(v.userId ?? ""),
          userName: String(v.userName ?? "Anonymous"),
          rating: Math.min(5, Math.max(1, Number(v.rating ?? 5))),
          text: String(v.text ?? ""),
          createdAt:
            ts && typeof ts.toDate === "function" ? ts.toDate() : null,
        };
      });
      // Newest first (client-side to avoid a composite index).
      list.sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      );
      onUpdate(list);
    },
    () => onUpdate([]),
  );
}

export async function addReview(input: {
  placeSlug: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
}): Promise<void> {
  await addDoc(collection(db, "reviews"), {
    placeSlug: input.placeSlug,
    userId: input.userId,
    userName: input.userName,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    text: input.text.trim().slice(0, 500),
    createdAt: serverTimestamp(),
  });
}

export async function deleteReview(reviewId: string): Promise<void> {
  await deleteDoc(doc(db, "reviews", reviewId));
}

export function averageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}
