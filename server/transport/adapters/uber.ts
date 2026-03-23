import type { ProviderAdapter, BookingRequest, BookingResult } from "./base";

export class UberGuestRidesAdapter implements ProviderAdapter {
  readonly adapterKey = "uber_guest";

  static isConfigured(): boolean {
    return !!(process.env.UBER_CLIENT_ID && process.env.UBER_CLIENT_SECRET);
  }

  async book(request: BookingRequest): Promise<BookingResult> {
    if (!UberGuestRidesAdapter.isConfigured()) {
      throw new Error("Uber Guest Rides adapter is not configured. Set UBER_CLIENT_ID and UBER_CLIENT_SECRET.");
    }

    const externalRef = `UBR-${Date.now()}-${request.tripId}`;
    console.log(`[UberGuestRidesAdapter] Stub: would create Uber Guest Rides booking for trip ${request.tripId}`);

    return {
      externalRef,
      status: "confirmed",
      message: "Uber ride confirmed. Driver details will be sent to your contact.",
    };
  }

  async cancel(externalRef: string): Promise<void> {
    if (!UberGuestRidesAdapter.isConfigured()) {
      throw new Error("Uber Guest Rides adapter is not configured.");
    }
    console.log(`[UberGuestRidesAdapter] Stub: would cancel Uber booking ${externalRef}`);
  }
}
