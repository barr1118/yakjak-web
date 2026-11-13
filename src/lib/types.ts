export type Difficulty = "Easy" | "Moderate" | "Hard";

export type ProviderType =
  | "guide"
  | "homestay"
  | "culinary"
  | "craft"
  | "boat";

export type Role = "traveler" | "provider" | "admin";

export type BookingStatus =
  | "requested"
  | "confirmed"
  | "declined"
  | "completed"
  | "cancelled";

export type TrailCondition = "good" | "damaged" | "closed";

export interface AdatInfo {
  authority: string;
  permitRequired: boolean;
  rules: string[];
  calendarNote: string;
}

export interface SafetyInfo {
  contacts: { label: string; phone: string }[];
  hazards: string[];
  signal: string;
}

export interface Place {
  name: string;
  slug: string;
  image: string;
  descriptionKey: string;
  lat: number;
  lng: number;
  /** List of [lat, lng] points forming the trek polyline */
  track: [number, number][];
  difficulty: Difficulty;
  category: string;
  distance: number;
  estTime: string;
  elevationGain: number;
  rating: number;
  region?: string;
  bestSeason?: string;
  verified?: boolean;
  lastFieldCheck?: string;
  adat?: AdatInfo;
  safety?: SafetyInfo;
  gallery?: string[];
}

export interface Provider {
  id: string;
  ownerUid: string;
  name: string;
  type: ProviderType;
  bio: string;
  languages: string[];
  priceRange: string;
  destinationSlugs: string[];
  initials: string;
  color: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  contact: string;
  since: string;
}

export interface Offering {
  id: string;
  providerId: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  capacity: number;
  destinationSlug: string;
}

export interface Booking {
  id: string;
  travelerUid: string;
  travelerName: string;
  providerId: string;
  offeringId: string;
  destinationSlug: string;
  date: string;
  pax: number;
  notes: string;
  contact: string;
  status: BookingStatus;
  totalPrice: number;
  providerNote?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  placeSlug: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string | null;
  hidden?: boolean;
}

export interface TrailReport {
  id: string;
  placeSlug: string;
  userId: string;
  userName: string;
  condition: TrailCondition;
  notes: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  userUid: string;
  placeSlug: string;
  placeName: string;
  startedAt: string;
  completedAt: string;
  distanceKm: number;
  durationMin: number;
  track: [number, number][];
}

export interface DemoState {
  session: { uid: string; name: string; role: Role } | null;
  favorites: string[];
  bookings: Booking[];
  trips: Trip[];
  reviews: Review[];
  trailReports: TrailReport[];
  packs: string[];
  providerVerified: Record<string, boolean>;
}
