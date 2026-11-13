"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { t } from "@/lib/i18n";
import { demo } from "@/lib/demo-store";
import { formatRupiah } from "@/lib/providers";
import type { Offering, Provider } from "@/lib/types";

function tomorrow(): string {
  return new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
}

export default function BookingDialog({
  open,
  onClose,
  provider,
  offerings,
  destinationSlug,
  initialOfferingId,
}: {
  open: boolean;
  onClose: () => void;
  provider: Provider;
  offerings: Offering[];
  destinationSlug: string;
  initialOfferingId?: string;
}) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [offeringId, setOfferingId] = useState(
    initialOfferingId ?? offerings[0]?.id ?? "",
  );
  const [date, setDate] = useState(tomorrow());
  const [pax, setPax] = useState(2);
  const [notes, setNotes] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const offering = useMemo(
    () => offerings.find((o) => o.id === offeringId) ?? offerings[0],
    [offeringId, offerings],
  );

  if (!open || !user) return null;

  const perPax =
    offering?.unit.includes("orang") || offering?.unit.includes("person");
  const total = offering ? (perPax ? offering.price * pax : offering.price) : 0;

  const submit = () => {
    if (!offering) {
      setError("Pilih layanan dulu.");
      return;
    }
    if (!date) {
      setError("Tanggal wajib diisi.");
      return;
    }
    if (!contact.trim()) {
      setError("Nomor kontak wajib diisi agar penyedia bisa menghubungi.");
      return;
    }
    demo.addBooking({
      travelerUid: user.uid,
      travelerName: user.displayName ?? user.email ?? "Traveler",
      providerId: provider.id,
      offeringId: offering.id,
      destinationSlug,
      date,
      pax,
      notes: notes.trim(),
      contact: contact.trim(),
      totalPrice: total,
    });
    setError(null);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0B1F17]/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#DED7C4] bg-[#FBFAF6] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#5D6F61] hover:bg-[#EDE7D8]"
          aria-label="Close"
        >
          ✕
        </button>

        {done ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E3ECD9] text-2xl text-[#1F4D3A]">
              ✓
            </div>
            <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
              {t(lang, "booking_success")}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-[#5D6F61]">
              {t(lang, "booking_pay_note")}
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Link
                href="/trips"
                onClick={onClose}
                className="rounded-full bg-[#1F4D3A] px-5 py-2.5 text-xs font-extrabold text-white"
              >
                {t(lang, "booking_my")}
              </Link>
              <button
                onClick={onClose}
                className="rounded-full border border-[#DED7C4] px-5 py-2.5 text-xs font-bold text-[#1F2A21]"
              >
                {lang === "id" ? "Tutup" : "Close"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#B54708]">
              {t(lang, "booking_title")}
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
              {provider.name}
            </h2>
            <p className="mt-1 text-xs text-[#5D6F61]">
              {t(lang, "booking_pay_note")}
            </p>

            {offerings.length > 1 && (
              <label className="mt-4 block text-xs font-bold text-[#5D6F61]">
                Layanan
                <select
                  value={offeringId}
                  onChange={(e) => setOfferingId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DED7C4] bg-white px-3 py-2.5 text-sm text-[#1F2A21]"
                >
                  {offerings.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title} — {formatRupiah(o.price)}/{o.unit}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {offering && (
              <div className="mt-3 rounded-xl bg-[#F1EBDA] px-3 py-2.5 text-xs text-[#5D6F61]">
                <span className="font-extrabold text-[#1F2A21]">
                  {offering.title}
                </span>
                <br />
                {formatRupiah(offering.price)} / {offering.unit} ·{" "}
                {t(lang, "capacity")} {offering.capacity}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold text-[#5D6F61]">
                {t(lang, "booking_date")}
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DED7C4] bg-white px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block text-xs font-bold text-[#5D6F61]">
                {t(lang, "booking_pax")}
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={pax}
                  onChange={(e) => setPax(Math.max(1, Number(e.target.value)))}
                  className="mt-1 w-full rounded-xl border border-[#DED7C4] bg-white px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            <label className="mt-3 block text-xs font-bold text-[#5D6F61]">
              {t(lang, "booking_contact")}
              <input
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="08xx…"
                className="mt-1 w-full rounded-xl border border-[#DED7C4] bg-white px-3 py-2.5 text-sm"
              />
            </label>

            <label className="mt-3 block text-xs font-bold text-[#5D6F61]">
              {t(lang, "booking_notes")}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-[#DED7C4] bg-white px-3 py-2.5 text-sm"
                placeholder="Jam mulai, kebutuhan khusus, jumlah anak…"
              />
            </label>

            {error && (
              <p className="mt-3 rounded-xl bg-[#F7D7D3] px-3 py-2 text-xs font-bold text-[#B42318]">
                {error}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#E3ECD9] px-4 py-3">
              <span className="text-xs font-bold text-[#1F4D3A]">
                {t(lang, "booking_total")}
              </span>
              <span className="text-lg font-black text-[#1F4D3A]">
                {formatRupiah(total)}
              </span>
            </div>

            <button
              onClick={submit}
              className="mt-3 w-full rounded-xl bg-[#1F4D3A] py-3 text-sm font-extrabold text-white hover:bg-[#2F7D4F]"
            >
              {t(lang, "booking_submit")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
