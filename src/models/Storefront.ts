// Define storefront keys as a const tuple so they behave like an enum (easy to iterate and type-safe)
const STOREFRONT_KEYS = ["Steam", "Epic"] as const;
export type StorefrontKey = typeof STOREFRONT_KEYS[number];

// Metadata for each storefront (id used by ITAD and a canonical match string)
const STOREFRONTS: Readonly<Record<StorefrontKey, { id: number; match: string }>> = {
  Steam: { id: 61, match: "steam" },
  Epic: { id: 16, match: "epic" },
};

import { SETTINGS, Setting } from "../utils/Settings";

// Internal helpers (not exported directly) — consumers should use the Storefronts namespace below.

function enabledKeysFromMapInternal(storefrontMap: Record<string, boolean> | undefined): StorefrontKey[] {
  if (!storefrontMap) return [];
  return STOREFRONT_KEYS.filter((k) => storefrontMap[k]);
}

async function loadEnabledKeysInternal(): Promise<StorefrontKey[]> {
  const map = await SETTINGS.load(Setting.STOREFRONTS);
  return enabledKeysFromMapInternal(map);
}



// Namespaced API to make it obvious these helpers are for storefronts.
export const Storefronts = {
  keys: STOREFRONT_KEYS as readonly StorefrontKey[],
  getEnabledStorefronts: async (): Promise<StorefrontKey[]> => await loadEnabledKeysInternal(),
  meta: STOREFRONTS,
}

export default Storefronts;
