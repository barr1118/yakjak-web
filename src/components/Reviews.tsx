"use client";

import { useEffect, useState } from "react";
import {
  addReview,
  averageRating,
  deleteReview,
  subscribeReviews,
  type Review,
} from "@/lib/reviews";
import { useAuth } from "@/lib/auth";
import { t, type Lang } from "@/lib/i18n";
import LoginDialog from "./LoginDialog";

function Stars({
  value,
  onPick,
  size = "text-2xl",
}: {
  value: number;
  onPick?: (v: number) => void;
  size?: string;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onPick}
          onClick={() => onPick?.(s)}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
          className={`${size} leading-none transition-transform ${
            onPick ? "cursor-pointer hover:scale-125" : ""
          } ${s <= value ? "text-[#C58A1B]" : "text-[#E2DAC8]"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/** Community reviews for one destination. */
export default function Reviews({
  placeSlug,
  lang,
}: {
  placeSlug: string;
  lang: Lang;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeReviews(placeSlug, setReviews, {
      demo: user?.isDemo ?? false,
    });
    return () => unsub();
  }, [placeSlug, user?.isDemo]);

  const avg = averageRating(reviews);

  const submit = async () => {
    if (!user || text.trim() === "" || sending) return;
    setSending(true);
    try {
      await addReview({
        placeSlug,
        userId: user.uid,
        userName: user.displayName ?? user.email ?? "Anonymous",
        rating,
        text,
      });
      setText("");
      setRating(5);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-extrabold text-[#17251C]">
          {t(lang, "reviews_title")}
        </h3>
        {avg != null && (
          <span className="rounded-full bg-[#E8F0E4] px-2.5 py-1 text-xs font-extrabold text-[#1B6B3A]">
            ★ {avg.toFixed(1)} · {reviews.length}
          </span>
        )}
      </div>

      {/* Form */}
      <div className="mt-3 rounded-2xl border border-[#E2DAC8] bg-[#FFFFFF] p-4 shadow-sm">
        {user ? (
          <>
            <Stars value={rating} onPick={setRating} />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={t(lang, "review_placeholder")}
              className="mt-3 w-full rounded-lg border border-[#E2DAC8] bg-[#F7F3EA] px-3 py-2.5 text-sm text-[#17251C] placeholder-[#5B6B5F] outline-none focus:border-[#1B6B3A]"
            />
            <button
              onClick={submit}
              disabled={sending || text.trim() === ""}
              className="mt-3 rounded-lg bg-[#1B6B3A] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-50"
            >
              {t(lang, "review_submit")}
            </button>
          </>
        ) : (
          <button
            onClick={() => setLoginOpen(true)}
            className="w-full rounded-lg border border-dashed border-[#E2DAC8] py-4 text-sm font-bold text-[#5B6B5F] hover:border-[#1B6B3A] hover:text-[#1B6B3A]"
          >
            {t(lang, "review_login_prompt")}
          </button>
        )}
      </div>

      {/* List */}
      <div className="mt-3 space-y-3">
        {reviews.length === 0 && (
          <p className="py-4 text-center text-sm text-[#5B6B5F]">
            {t(lang, "review_empty")}
          </p>
        )}
        {reviews.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-[#E2DAC8] bg-[#FFFFFF] p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ECE5D6] text-sm font-black text-[#1B6B3A]">
                {(r.userName[0] ?? "?").toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-extrabold text-[#17251C]">
                  {r.userName}
                </div>
                <Stars value={r.rating} size="text-sm" />
              </div>
              {user?.uid === r.userId && (
                <button
                  onClick={() => deleteReview(r.id, user?.uid)}
                  className="text-xs font-bold text-[#5B6B5F] hover:text-[#B42318]"
                >
                  {t(lang, "review_delete")}
                </button>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#17251C]">{r.text}</p>
          </div>
        ))}
      </div>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
