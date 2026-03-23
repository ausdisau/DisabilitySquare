const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface DirectionsResult {
  distanceKm: number;
  durationMinutes: number;
}

export async function getDirections(
  pickupLat: string,
  pickupLng: string,
  dropoffLat: string,
  dropoffLng: string
): Promise<DirectionsResult> {
  if (!GOOGLE_MAPS_API_KEY) {
    return estimateDirections(pickupLat, pickupLng, dropoffLat, dropoffLng);
  }

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", `${pickupLat},${pickupLng}`);
  url.searchParams.set("destination", `${dropoffLat},${dropoffLng}`);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);

  try {
    const response = await fetch(url.toString());
    const data = await response.json() as any;

    if (data.status !== "OK" || !data.routes?.length) {
      console.warn("[transport/maps] Directions API returned no routes, falling back to estimate", data.status);
      return estimateDirections(pickupLat, pickupLng, dropoffLat, dropoffLng);
    }

    const leg = data.routes[0].legs[0];
    const distanceKm = leg.distance.value / 1000;
    const durationMinutes = Math.ceil(leg.duration.value / 60);

    return { distanceKm, durationMinutes };
  } catch (err) {
    console.error("[transport/maps] Directions API error:", err);
    return estimateDirections(pickupLat, pickupLng, dropoffLat, dropoffLng);
  }
}

function estimateDirections(
  pickupLat: string,
  pickupLng: string,
  dropoffLat: string,
  dropoffLng: string
): DirectionsResult {
  const lat1 = parseFloat(pickupLat);
  const lng1 = parseFloat(pickupLng);
  const lat2 = parseFloat(dropoffLat);
  const lng2 = parseFloat(dropoffLng);

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  const distanceKm = straightLine * 1.35;
  const durationMinutes = Math.ceil((distanceKm / 30) * 60);

  return { distanceKm: Math.max(distanceKm, 1), durationMinutes: Math.max(durationMinutes, 5) };
}

export interface RateCard {
  baseFare: number;
  perKm: number;
  perMinute: number;
  wheelchairSurcharge: number;
  rampSurcharge: number;
  driverAssistanceSurcharge: number;
}

export function calculatePrice(
  distanceKm: number,
  durationMinutes: number,
  rateCard: RateCard,
  accessNeeds: string[]
): number {
  let price = rateCard.baseFare;
  price += rateCard.perKm * distanceKm;
  price += rateCard.perMinute * durationMinutes;

  if (accessNeeds.includes("wheelchair")) price += rateCard.wheelchairSurcharge;
  if (accessNeeds.includes("ramp")) price += rateCard.rampSurcharge;
  if (accessNeeds.includes("driver_assistance")) price += rateCard.driverAssistanceSurcharge;

  return Math.round(price * 100) / 100;
}
