export type Difficulty = "Easy" | "Moderate" | "Hard";

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
}
