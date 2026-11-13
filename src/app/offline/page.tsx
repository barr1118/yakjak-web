import { redirect } from "next/navigation";

/** The old offline tab now lives inside /trips. */
export default function OfflinePage() {
  redirect("/trips");
}
