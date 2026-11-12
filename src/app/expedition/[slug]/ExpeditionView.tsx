"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { useAuth } from "@/lib/auth";
import { addHistory } from "@/lib/history";
import {
  decimateTrack,
  formatDuration,
  haversineKm,
  trackDistanceKm,
  type LatLng,
} from "@/lib/geo";
import LoginDialog from "@/components/LoginDialog";

const TrekMap = dynamic(() => import("@/components/TrekMap"), { ssr: false });

// Ignore fixes worse than this (meters) and jumps smaller than this,
// so a stationary phone doesn't draw spaghetti.
const MAX_ACCURACY_M = 60;
const MIN_STEP_M = 8;

type Phase = "idle" | "tracking" | "done";

/** Live GPS expedition mode: record the hike, then save it to history. */
export default function ExpeditionView({ place }: { place: Place }) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("idle");
  const [points, setPoints] = useState<LatLng[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [follow, setFollow] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const watchId = useRef<number | null>(null);
  const timerId = useRef<ReturnType<typeof setInterval> | null>(null);
  const startAt = useRef(0);
  const pointsRef = useRef<LatLng[]>([]);
  const stopTracking = useCallback(() => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (timerId.current) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
  }, []);

  useEffect(() => stopTracking, [stopTracking]);

  const start = () => {
    if (!("geolocation" in navigator)) {
      setError(t(lang, "exp_unsupported"));
      return;
    }
    setError(null);
    setPoints([]);
    pointsRef.current = [];
    setElapsed(0);
    setSaved(false);
    setFollow(true);
    startAt.current = Date.now();
    setPhase("tracking");
    timerId.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startAt.current) / 1000));
    }, 1000);
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (pos.coords.accuracy > MAX_ACCURACY_M) return;
        const fix: LatLng = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        const prev = pointsRef.current[pointsRef.current.length - 1];
        if (
          prev &&
          haversineKm(prev.lat, prev.lng, fix.lat, fix.lng) * 1000 < MIN_STEP_M
        ) {
          return;
        }
        pointsRef.current = [...pointsRef.current, fix];
        setPoints(pointsRef.current);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError(t(lang, "exp_denied"));
          stopTracking();
          setPhase("idle");
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
  };

  const discard = () => {
    stopTracking();
    pointsRef.current = [];
    setPoints([]);
    setElapsed(0);
    setPhase("idle");
  };

  const finish = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setSaving(true);
    try {
      const track = pointsRef.current;
      await addHistory(user.uid, {
        placeSlug: place.slug,
        placeName: place.name,
        distanceKm: Math.round(trackDistanceKm(track) * 100) / 100,
        durationMin: Math.round(elapsed / 60),
        track: decimateTrack(track),
      });
      stopTracking();
      setSaved(true);
      setPhase("done");
    } finally {
      setSaving(false);
    }
  };

  const distance = trackDistanceKm(points);
  const last = points[points.length - 1] ?? null;

  return (
    <div className="-mx-4 -mt-6 sm:-mx-6">
      <div className="border-b border-[#D9D2BD] bg-[#FFFFFF] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            href={`/place/${place.slug}`}
            aria-label={t(lang, "back")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4F1E8] text-lg text-[#1F2A21]"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold tracking-tight text-[#1F2A21]">
              {place.name}
            </h1>
            <p className="text-xs text-[#5D6F61]">
              {place.distance} {t(lang, "unit_km")} · {place.difficulty}
            </p>
          </div>
          {phase === "tracking" && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#E05F14] px-3 py-1 text-[11px] font-black tracking-widest text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              {t(lang, "exp_live")}
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
        {error && (
          <div className="mb-4 rounded-xl border border-[#E89B93] bg-[#F7D7D3] p-3 text-sm text-[#B42318]">
            {error}
          </div>
        )}

        <div className="relative">
          <TrekMap
            places={[place]}
            center={[place.lat, place.lng]}
            zoom={15}
            height={380}
            activeSlug={place.slug}
            userPosition={last ? [last.lat, last.lng] : null}
            traveled={points.map((p) => [p.lat, p.lng])}
            follow={follow}
            onTakeover={() => setFollow(false)}
            minZoom={5}
            maxZoom={17}
          />
          {phase === "tracking" && !follow && (
            <button
              onClick={() => setFollow(true)}
              className="absolute right-3 top-3 z-[500] rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm"
            >
              📍 {t(lang, "exp_recenter")}
            </button>
          )}
        </div>

        {/* Live stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <ExpStat
            label={t(lang, "exp_distance")}
            value={`${distance.toFixed(2)} km`}
          />
          <ExpStat label={t(lang, "exp_duration")} value={formatDuration(elapsed)} />
          <ExpStat label="GPS" value={`${points.length}`} />
        </div>

        {/* Controls */}
        <div className="mt-4 pb-8">
          {phase === "idle" && (
            <>
              <button
                onClick={start}
                className="w-full rounded-2xl bg-[#E05F14] py-4 font-extrabold text-white transition-colors hover:bg-[#B54F0E]"
              >
                ▶ {t(lang, "exp_start")}
              </button>
              <p className="mt-2 text-center text-xs text-[#5D6F61]">
                {t(lang, "exp_tap_start")}
              </p>
            </>
          )}
          {phase === "tracking" && (
            <div className="flex gap-3">
              <button
                onClick={discard}
                className="flex-1 rounded-2xl border border-[#D9D2BD] bg-[#FFFFFF] py-4 font-extrabold text-[#5D6F61]"
              >
                {t(lang, "exp_discard")}
              </button>
              <button
                onClick={finish}
                disabled={saving}
                className="flex-[2] rounded-2xl bg-[#2F7D4F] py-4 font-extrabold text-white disabled:opacity-60"
              >
                {t(lang, "exp_finish")}
              </button>
            </div>
          )}
          {phase === "done" && saved && (
            <div className="rounded-2xl border border-[#2F7D4F] bg-[#E2EFE0] p-4 text-center">
              <div className="font-extrabold text-[#2F7D4F]">
                ✓ {t(lang, "exp_saved")}
              </div>
              <Link
                href="/profile"
                className="mt-2 inline-block text-sm font-bold text-[#2F7D4F] underline"
              >
                {t(lang, "nav_profile")}
              </Link>
            </div>
          )}
        </div>
      </div>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

function ExpStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#D9D2BD] bg-[#FFFFFF] px-2 py-3 text-center shadow-sm">
      <div className="truncate text-base font-black text-[#1F2A21]">{value}</div>
      <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#5D6F61]">
        {label}
      </div>
    </div>
  );
}
