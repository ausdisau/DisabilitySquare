export interface BookingRequest {
  tripId: number;
  pickupAddress: string;
  pickupLat: string;
  pickupLng: string;
  dropoffAddress: string;
  dropoffLat: string;
  dropoffLng: string;
  vehicleId: number;
  vehicleType: string;
  accessNeeds: string[];
  priceAud: number;
  sessionId?: string;
  userId?: string;
}

export interface BookingResult {
  externalRef: string;
  status: "pending" | "confirmed";
  message?: string;
}

export interface ProviderAdapter {
  readonly adapterKey: string;
  book(request: BookingRequest): Promise<BookingResult>;
  cancel(externalRef: string): Promise<void>;
}
