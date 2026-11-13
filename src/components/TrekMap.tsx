"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place } from "@/lib/types";

function pinIcon(active = false) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:#FFFFFF;border:2px solid ${active ? "#1B6B3A" : "#C2410C"};color:${active ? "#1B6B3A" : "#C2410C"};font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,.5)">📍</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 32],
  });
}

/**
 * Pulsing blue dot for the live GPS position (expedition mode).
 */
function userDot() {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:22px;height:22px;"><span style="position:absolute;inset:0;border-radius:9999px;background:#0F766E;opacity:.35;animation:yakPing 1.6s ease-out infinite;"></span><span style="position:absolute;inset:5px;border-radius:9999px;background:#0F766E;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);"></span></div><style>@keyframes yakPing{0%{transform:scale(.6);opacity:.5}80%,100%{transform:scale(1.7);opacity:0}}</style>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

let cachedUserDot: L.DivIcon | null = null;
function getUserDot() {
  if (!cachedUserDot) cachedUserDot = userDot();
  return cachedUserDot;
}

/**
 * Keeps the camera on the hiker until they grab the map themselves.
 */
function FollowController({
  position,
  follow,
  onTakeover,
}: {
  position: [number, number] | null;
  follow: boolean;
  onTakeover: () => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (position && follow)
      map.setView(position, map.getZoom(), { animate: true });
  }, [map, position, follow]);
  useEffect(() => {
    map.on("dragstart", onTakeover);
    return () => {
      map.off("dragstart", onTakeover);
    };
  }, [map, onTakeover]);
  return null;
}

/**
 * OpenStreetMap trek map (mirrors flutter_map usage in detail_page.dart).
 * Always imported with next/dynamic ssr:false.
 *
 * Deliberately stock Leaflet behavior — no custom gesture systems:
 * drag pans, wheel zooms, touch works natively. Only the zoom range is
 * limited so tiles never stretch into garbage.
 */
export default function TrekMap({
  places,
  center,
  zoom = 13,
  height = 250,
  activeSlug,
  minZoom,
  maxZoom,
  userPosition = null,
  traveled = [],
  follow = false,
  onTakeover,
}: {
  places: Place[];
  center: [number, number];
  zoom?: number;
  height?: number;
  activeSlug?: string;
  minZoom?: number;
  maxZoom?: number;
  /** Live GPS fix (expedition mode). */
  userPosition?: [number, number] | null;
  /** Recorded path drawn over the planned route. */
  traveled?: [number, number][];
  /** Keep camera on the hiker until they drag the map. */
  follow?: boolean;
  onTakeover?: () => void;
}) {
  // Stable pin icons: recreating them every render makes markers flicker.
  const icons = useMemo(() => {
    const m = new Map<string, L.DivIcon>();
    for (const p of places) {
      m.set(`${p.slug}|true`, pinIcon(true));
      m.set(`${p.slug}|false`, pinIcon(false));
    }
    return m;
  }, [places]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#E2DAC8]"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        style={{ height: "100%", width: "100%", background: "#F3EEE2" }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {places.map((p) =>
          p.track.length > 0 ? (
            <Polyline
              key={p.slug}
              positions={p.track.map(([la, ln]) => [la, ln] as [number, number])}
              pathOptions={{
                color: "#1B6B3A",
                weight: p.slug === activeSlug ? 5 : 3,
              }}
            />
          ) : null,
        )}
        {places.map((p) => (
          <Marker
            key={p.slug}
            position={[p.lat, p.lng]}
            icon={icons.get(`${p.slug}|${p.slug === activeSlug}`)}
          >
            <Tooltip>{p.name}</Tooltip>
          </Marker>
        ))}
        {traveled.length > 1 && (
          <Polyline
            positions={traveled}
            pathOptions={{ color: "#C2410C", weight: 4, dashArray: "8 6" }}
          />
        )}
        {userPosition && (
          <Marker position={userPosition} icon={getUserDot()} interactive={false} />
        )}
        {onTakeover && (
          <FollowController
            position={userPosition}
            follow={follow}
            onTakeover={onTakeover}
          />
        )}
      </MapContainer>
    </div>
  );
}
