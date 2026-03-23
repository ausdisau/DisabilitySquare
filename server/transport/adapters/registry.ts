import type { ProviderAdapter } from "./base";
import { ZoomlyManualAdapter } from "./zoomly";
import { UberGuestRidesAdapter } from "./uber";

const adapters: Map<string, ProviderAdapter> = new Map();

const zoomly = new ZoomlyManualAdapter();
adapters.set(zoomly.adapterKey, zoomly);

if (UberGuestRidesAdapter.isConfigured()) {
  const uber = new UberGuestRidesAdapter();
  adapters.set(uber.adapterKey, uber);
}

export function getAdapter(adapterKey: string): ProviderAdapter {
  const adapter = adapters.get(adapterKey);
  if (!adapter) {
    console.warn(`[adapter-registry] No adapter found for key "${adapterKey}", falling back to zoomly_manual`);
    return adapters.get("zoomly_manual")!;
  }
  return adapter;
}
