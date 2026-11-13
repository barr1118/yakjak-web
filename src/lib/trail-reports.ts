"use client";

import { demo, getDemoState, subscribeDemo } from "./demo-store";
import type { TrailCondition, TrailReport } from "./types";

export function localTrailReports(placeSlug: string): TrailReport[] {
  return getDemoState()
    .trailReports.filter((r) => r.placeSlug === placeSlug)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function subscribeTrailReports(
  placeSlug: string,
  onUpdate: (reports: TrailReport[]) => void,
): () => void {
  const push = () => onUpdate(localTrailReports(placeSlug));
  push();
  return subscribeDemo(push);
}

export function addTrailReport(input: {
  placeSlug: string;
  userId: string;
  userName: string;
  condition: TrailCondition;
  notes: string;
}): TrailReport {
  return demo.addTrailReport(input);
}

export const CONDITION_LABEL: Record<TrailCondition, string> = {
  good: "Baik",
  damaged: "Rusak sebagian",
  closed: "Ditutup",
};

export const CONDITION_STYLE: Record<TrailCondition, string> = {
  good: "bg-[#E8F0E4] text-[#1B6B3A] border-[#1B6B3A]/30",
  damaged: "bg-[#FBE9DD] text-[#C2410C] border-[#C2410C]/30",
  closed: "bg-[#F7D7D3] text-[#B42318] border-[#B42318]/30",
};
