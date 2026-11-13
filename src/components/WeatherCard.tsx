"use client";

import { useEffect, useState } from "react";
import {
  fetchWeather,
  isBadHikingWeather,
  wmoInfo,
  type WeatherData,
} from "@/lib/weather";
import { t, type Lang } from "@/lib/i18n";

function dayLabel(dateStr: string, lang: Lang): string {
  const d = new Date(dateStr + "T00:00:00");
  const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysId = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  return (lang === "id" ? daysId : daysEn)[d.getDay()]!;
}

/** Live forecast card (Open-Meteo, no API key needed). */
export default function WeatherCard({
  lat,
  lng,
  lang,
}: {
  lat: number;
  lng: number;
  lang: Lang;
}) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) setFailed(true);
    }, 9000);
    fetchWeather(lat, lng)
      .then((w) => {
        if (!cancelled) {
          clearTimeout(timeout);
          setData(w);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTimeout(timeout);
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [lat, lng]);

  if (failed) {
    return (
      <div className="rounded-2xl border border-[#E5DDCB] bg-white px-4 py-3 text-[11px] text-[#5B6B5F]">
        {lang === "id"
          ? "Data cuaca belum tersedia. Cek lagi saat online."
          : "Weather data is not available. Check again when online."}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="animate-pulse rounded-2xl border border-[#E2DAC8] bg-[#FFFFFF] p-5 shadow-sm">
        <div className="h-5 w-32 rounded bg-[#ECE5D6]" />
        <div className="mt-3 h-10 w-48 rounded bg-[#ECE5D6]" />
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-[#ECE5D6]" />
          ))}
        </div>
      </div>
    );
  }

  const cur = wmoInfo(data.current.code, lang);
  const bad = isBadHikingWeather(data);

  return (
    <div className="rounded-2xl border border-[#E2DAC8] bg-[#FFFFFF] p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-5xl">{cur.emoji}</span>
        <div>
          <div className="text-4xl font-black tracking-tight text-[#17251C]">
            {Math.round(data.current.temp)}°C
          </div>
          <div className="text-sm font-bold text-[#17251C]">{cur.label}</div>
          <div className="text-xs text-[#5B6B5F]">
            {t(lang, "weather_feels")} {Math.round(data.current.feelsLike)}°C
          </div>
        </div>
        <div
          className={`ml-auto rounded-full px-3 py-1 text-[11px] font-extrabold ${
            bad ? "bg-[#F7D7D3] text-[#B42318]" : "bg-[#E8F0E4] text-[#1B6B3A]"
          }`}
        >
          {bad ? t(lang, "weather_bad") : t(lang, "weather_good")}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <MiniStat
          icon="💧"
          value={`${data.current.humidity}%`}
          label={t(lang, "weather_humidity")}
        />
        <MiniStat
          icon="💨"
          value={`${Math.round(data.current.windSpeed)} km/h`}
          label={t(lang, "weather_wind")}
        />
        <MiniStat
          icon="🌧️"
          value={`${data.current.precipitation.toFixed(1)} mm`}
          label={t(lang, "weather_precip")}
        />
      </div>

      <div className="mt-4 border-t border-[#E2DAC8] pt-3">
        <div className="text-xs font-extrabold uppercase tracking-widest text-[#5B6B5F]">
          {t(lang, "weather_next_days")}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {data.daily.slice(0, 4).map((d) => {
            const info = wmoInfo(d.code, lang);
            return (
              <div
                key={d.date}
                className="rounded-xl bg-[#F7F3EA] px-2 py-2.5 text-center"
              >
                <div className="text-[11px] font-extrabold text-[#5B6B5F]">
                  {dayLabel(d.date, lang)}
                </div>
                <div className="mt-1 text-2xl">{info.emoji}</div>
                <div className="mt-1 text-xs font-extrabold text-[#17251C]">
                  {Math.round(d.tMax)}° / {Math.round(d.tMin)}°
                </div>
                {d.precipProb != null && d.precipProb >= 20 && (
                  <div className="text-[10px] font-bold text-[#1B6B3A]">
                    💧 {Math.round(d.precipProb)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-[#F7F3EA] px-2 py-2.5">
      <div className="text-lg">{icon}</div>
      <div className="mt-0.5 text-sm font-extrabold text-[#17251C]">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-[#5B6B5F]">
        {label}
      </div>
    </div>
  );
}
