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
  good: "bg-[#E2EFE0] text-[#2F7D4F] border-[#2F7D4F]/30",
  damaged: "bg-[#FDF0E3] text-[#B54708] border-[#B54708]/30",
  closed: "bg-[#F7D7D3] text-[#B42318] border-[#B42318]/30",
};
