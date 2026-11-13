import { offerings, providers } from "./seed";
import type { DemoState, Offering, Provider, ProviderType } from "./types";

export const PROVIDER_TYPE_LABEL: Record<ProviderType, { id: string; en: string }> = {
  guide: { id: "Pemandu", en: "Guide" },
  homestay: { id: "Homestay", en: "Homestay" },
  culinary: { id: "Kuliner", en: "Food" },
  craft: { id: "Kerajinan", en: "Craft" },
  boat: { id: "Perahu", en: "Boat" },
};

export function effectiveProviders(state: DemoState): Provider[] {
  return providers.map((p) =>
    Object.prototype.hasOwnProperty.call(state.providerVerified, p.id)
      ? { ...p, verified: state.providerVerified[p.id]! }
      : p,
  );
}

export function effectiveProvider(
  id: string,
  state: DemoState,
): Provider | undefined {
  const p = providers.find((x) => x.id === id);
  if (!p) return undefined;
  return Object.prototype.hasOwnProperty.call(state.providerVerified, id)
    ? { ...p, verified: state.providerVerified[id]! }
    : p;
}

export function offeringsForProvider(providerId: string): Offering[] {
  return offerings.filter((o) => o.providerId === providerId);
}

export function providersForPlace(
  slug: string,
  state: DemoState,
): Provider[] {
  return effectiveProviders(state).filter((p) =>
    p.destinationSlugs.includes(slug),
  );
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function providerTypeLabel(type: ProviderType, lang: "id" | "en"): string {
  return PROVIDER_TYPE_LABEL[type][lang];
}
