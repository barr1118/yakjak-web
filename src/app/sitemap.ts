import type { MetadataRoute } from "next";
import { places } from "@/lib/places";
import { providers } from "@/lib/seed";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/providers", "/trips", "/map", "/profile"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }),
  );

  const placePages = places.map((place) => ({
    url: `${base}/place/${place.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const providerPages = providers.map((provider) => ({
    url: `${base}/providers/${provider.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...placePages, ...providerPages];
}
