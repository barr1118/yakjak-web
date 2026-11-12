import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlaceBySlug, places } from "@/lib/places";
import ExpeditionView from "./ExpeditionView";

export function generateStaticParams() {
  return places.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);
  if (!place) return { title: "Not found — YAKJAK.ID" };
  return {
    title: `Expedition: ${place.name} — YAKJAK.ID`,
    description: `Live GPS tracking for the ${place.name} trek.`,
  };
}

export default async function ExpeditionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);
  if (!place) notFound();
  return <ExpeditionView place={place} />;
}
