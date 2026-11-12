import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlaceBySlug, places } from "@/lib/places";
import DetailView from "./DetailView";

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
    title: `${place.name} — YAKJAK.ID`,
    description: `${place.name}: ${place.distance} km trek, ${place.difficulty}, rating ${place.rating}.`,
  };
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);
  if (!place) notFound();
  return <DetailView place={place} />;
}
