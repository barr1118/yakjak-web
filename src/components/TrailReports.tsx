"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { t } from "@/lib/i18n";
import {
  CONDITION_STYLE,
  addTrailReport,
  subscribeTrailReports,
} from "@/lib/trail-reports";
import type { TrailCondition, TrailReport } from "@/lib/types";
import LoginDialog from "./LoginDialog";

const CONDITIONS: TrailCondition[] = ["good", "damaged", "closed"];

function conditionKey(c: TrailCondition) {
  return c === "good"
    ? "trail_good"
    : c === "damaged"
      ? "trail_damaged"
      : "trail_closed";
}

export default function TrailReports({ placeSlug }: { placeSlug: string }) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [reports, setReports] = useState<TrailReport[]>([]);
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [condition, setCondition] = useState<TrailCondition>("good");
  const [notes, setNotes] = useState("");

  useEffect(() => subscribeTrailReports(placeSlug, setReports), [placeSlug]);

  const submit = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (!notes.trim()) return;
    addTrailReport({
      placeSlug,
      userId: user.uid,
      userName: user.displayName ?? user.email ?? "Traveler",
      condition,
      notes: notes.trim().slice(0, 400),
    });
    setNotes("");
    setCondition("good");
    setOpen(false);
  };

  return (
    <section className="rounded-2xl border border-[#E5DDCB] bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#5B6B5F]">
          {t(lang, "trail_reports_title")}
        </h3>
        <button
          onClick={() => (user ? setOpen((v) => !v) : setLoginOpen(true))}
          className="rounded-full border border-[#E5DDCB] px-3 py-1.5 text-[10px] font-extrabold text-[#14532D] hover:bg-[#F3EEE2]"
        >
          + {t(lang, "trail_report_add")}
        </button>
      </div>

      {open && (
        <div className="mt-3 rounded-xl bg-[#FAF7EF] p-3">
          <div className="flex flex-wrap gap-1.5">
            {CONDITIONS.map((c) => (
              <button
                key={c}
                onClick={() => setCondition(c)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${
                  condition === c
                    ? CONDITION_STYLE[c]
                    : "border-[#E5DDCB] bg-white text-[#5B6B5F]"
                }`}
              >
                {t(lang, conditionKey(c))}
              </button>
            ))}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder={t(lang, "trail_notes")}
            className="mt-2 w-full resize-none rounded-xl border border-[#E5DDCB] bg-white px-3 py-2 text-xs"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-full px-3 py-1.5 text-[10px] font-bold text-[#5B6B5F]"
            >
              {lang === "id" ? "Batal" : "Cancel"}
            </button>
            <button
              onClick={submit}
              disabled={!notes.trim()}
              className="rounded-full bg-[#14532D] px-3 py-1.5 text-[10px] font-extrabold text-white disabled:opacity-40"
            >
              {t(lang, "trail_submit")}
            </button>
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <p className="mt-3 text-[11px] text-[#7C6C58]">{t(lang, "trail_empty")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {reports.slice(0, 4).map((r) => (
            <li key={r.id} className="rounded-xl bg-[#FAF7EF] px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${CONDITION_STYLE[r.condition]}`}
                >
                  {t(lang, conditionKey(r.condition))}
                </span>
                <span className="text-[9px] font-bold text-[#7C6C58]">
                  {new Date(r.createdAt).toLocaleDateString(
                    lang === "id" ? "id-ID" : "en-GB",
                    { day: "numeric", month: "short" },
                  )}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-[#17251C]">
                {r.notes}
              </p>
              <p className="mt-0.5 text-[9px] text-[#7C6C58]">— {r.userName}</p>
            </li>
          ))}
        </ul>
      )}

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </section>
  );
}
