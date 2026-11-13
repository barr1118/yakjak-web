import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { providers } from "@/lib/seed";
import ProviderProfile from "./ProviderProfile";

export function generateStaticParams() {
  return providers.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const provider = providers.find((p) => p.id === id);
  if (!provider) return { title: "Provider not found — YakJak" };
  return {
    title: `${provider.name} — Penyedia Lokal YakJak`,
    description: provider.bio,
  };
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exists = providers.some((p) => p.id === id);
  if (!exists) notFound();
  return <ProviderProfile providerId={id} />;
}
