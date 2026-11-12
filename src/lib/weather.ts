import type { Lang } from "./i18n";

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  code: number;
}

export interface DayForecast {
  date: string;
  tMax: number;
  tMin: number;
  precipProb: number | null;
  code: number;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DayForecast[];
}

interface RawResponse {
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    precipitation: number;
    weather_code: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    weather_code: number[];
  };
}

/** Free, keyless forecast — https://open-meteo.com */
export async function fetchWeather(
  lat: number,
  lng: number,
): Promise<WeatherData> {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lng}` +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation" +
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code" +
    "&timezone=auto&forecast_days=4";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const raw = (await res.json()) as RawResponse;
  if (!raw.current || !raw.daily) throw new Error("weather empty");
  return {
    current: {
      temp: raw.current.temperature_2m,
      feelsLike: raw.current.apparent_temperature,
      humidity: raw.current.relative_humidity_2m,
      windSpeed: raw.current.wind_speed_10m,
      precipitation: raw.current.precipitation,
      code: raw.current.weather_code,
    },
    daily: raw.daily.time.map((date, i) => ({
      date,
      tMax: raw.daily!.temperature_2m_max[i]!,
      tMin: raw.daily!.temperature_2m_min[i]!,
      precipProb: raw.daily!.precipitation_probability_max[i] ?? null,
      code: raw.daily!.weather_code[i]!,
    })),
  };
}

const WMO: Record<number, { en: string; id: string; emoji: string }> = {
  0: { en: "Clear sky", id: "Cerah", emoji: "☀️" },
  1: { en: "Mostly clear", id: "Cerah", emoji: "🌤️" },
  2: { en: "Partly cloudy", id: "Berawan", emoji: "⛅" },
  3: { en: "Overcast", id: "Mendung", emoji: "☁️" },
  45: { en: "Fog", id: "Berkabut", emoji: "🌫️" },
  48: { en: "Icy fog", id: "Kabut es", emoji: "🌫️" },
  51: { en: "Light drizzle", id: "Gerimis", emoji: "🌦️" },
  53: { en: "Drizzle", id: "Gerimis", emoji: "🌦️" },
  55: { en: "Heavy drizzle", id: "Gerimis lebat", emoji: "🌧️" },
  56: { en: "Freezing drizzle", id: "Gerimis beku", emoji: "🌧️" },
  57: { en: "Freezing drizzle", id: "Gerimis beku", emoji: "🌧️" },
  61: { en: "Light rain", id: "Hujan ringan", emoji: "🌦️" },
  63: { en: "Rain", id: "Hujan", emoji: "🌧️" },
  65: { en: "Heavy rain", id: "Hujan lebat", emoji: "🌧️" },
  66: { en: "Freezing rain", id: "Hujan es", emoji: "🧊" },
  67: { en: "Freezing rain", id: "Hujan es", emoji: "🧊" },
  71: { en: "Light snow", id: "Salju ringan", emoji: "❄️" },
  73: { en: "Snow", id: "Salju", emoji: "❄️" },
  75: { en: "Heavy snow", id: "Salju lebat", emoji: "❄️" },
  77: { en: "Snow grains", id: "Butiran salju", emoji: "❄️" },
  80: { en: "Light showers", id: "Hujan sesaat", emoji: "🌦️" },
  81: { en: "Showers", id: "Hujan sesaat", emoji: "🌦️" },
  82: { en: "Violent showers", id: "Hujan deras", emoji: "🌧️" },
  85: { en: "Snow showers", id: "Hujan salju", emoji: "🌨️" },
  86: { en: "Snow showers", id: "Hujan salju", emoji: "🌨️" },
  95: { en: "Thunderstorm", id: "Badai petir", emoji: "⛈️" },
  96: { en: "Storm with hail", id: "Badai es", emoji: "⛈️" },
  99: { en: "Storm with hail", id: "Badai es", emoji: "⛈️" },
};

export function wmoInfo(
  code: number,
  lang: Lang,
): { label: string; emoji: string } {
  const w = WMO[code] ?? {
    en: "Unknown",
    id: "Tidak diketahui",
    emoji: "🌡️",
  };
  return { label: lang === "id" ? w.id : w.en, emoji: w.emoji };
}

/** Simple hiking-safety heuristic for the caution banner. */
export function isBadHikingWeather(w: WeatherData): boolean {
  const c = w.current;
  const todayProb = w.daily[0]?.precipProb ?? 0;
  return (
    c.precipitation > 0.5 ||
    c.windSpeed > 30 ||
    c.code >= 95 ||
    todayProb >= 70
  );
}
