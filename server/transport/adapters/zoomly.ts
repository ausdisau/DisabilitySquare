import type { ProviderAdapter, BookingRequest, BookingResult } from "./base";

export class ZoomlyManualAdapter implements ProviderAdapter {
  readonly adapterKey = "zoomly_manual";

  async book(request: BookingRequest): Promise<BookingResult> {
    const externalRef = `ZML-${Date.now()}-${request.tripId}`;
    return {
      externalRef,
      status: "pending",
      message: "Trip request submitted to Zoomly dispatch. A coordinator will confirm shortly.",
    };
  }

  async cancel(externalRef: string): Promise<void> {
    console.log(`[ZoomlyManualAdapter] Cancel request for booking ${externalRef} queued for manual processing`);
  }
}
