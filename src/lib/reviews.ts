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
import { demo, getDemoState, subscribeDemo } from "./demo-store";

export interface Review {
  id: string;
  placeSlug: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: Date | null;
}

function localReviews(placeSlug: string): Review[] {
  return getDemoState()
    .reviews.filter((r) => r.placeSlug === placeSlug && !r.hidden)
    .map((r) => ({
      ...r,
      createdAt: r.createdAt ? new Date(r.createdAt) : null,
    }));
}

function merge(local: Review[], remote: Review[]): Review[] {
  const map = new Map<string, Review>();
  for (const r of [...local, ...remote]) map.set(r.id, r);
  return [...map.values()].sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
  );
}

/**
 * Community reviews. The demo store always contributes seeded reviews;
 * Firestore is merged in for real deployments. Demo accounts stay local.
 */
export function subscribeReviews(
  placeSlug: string,
  onUpdate: (reviews: Review[]) => void,
  opts?: { demo?: boolean },
): Unsubscribe {
  if (opts?.demo) {
    const push = () => onUpdate(localReviews(placeSlug));
    push();
    return subscribeDemo(push);
  }

  let remote: Review[] = [];
  const push = () => onUpdate(merge(localReviews(placeSlug), remote));
  push();
  const unsubLocal = subscribeDemo(push);

  const q = query(collection(db, "reviews"), where("placeSlug", "==", placeSlug));
  const unsubRemote = onSnapshot(
    q,
    (snap) => {
      remote = snap.docs.map((d) => {
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
      push();
    },
    () => {
      remote = [];
      push();
    },
  );

  return () => {
    unsubLocal();
    unsubRemote();
  };
}

export async function addReview(input: {
  placeSlug: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
}): Promise<void> {
  if (input.userId.startsWith("demo-")) {
    demo.addReview(input);
    return;
  }
  await addDoc(collection(db, "reviews"), {
    placeSlug: input.placeSlug,
    userId: input.userId,
    userName: input.userName,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    text: input.text.trim().slice(0, 500),
    createdAt: serverTimestamp(),
  });
}

export async function deleteReview(
  reviewId: string,
  userId?: string,
): Promise<void> {
  if (userId?.startsWith("demo-")) {
    demo.deleteReview(reviewId);
    return;
  }
  await deleteDoc(doc(db, "reviews", reviewId));
}

export function averageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}
