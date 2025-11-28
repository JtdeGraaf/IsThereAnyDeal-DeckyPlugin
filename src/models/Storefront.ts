// Define storefront keys as a const tuple so they behave like an enum (easy to iterate and type-safe)
const STOREFRONT_KEYS = ["Steam", "Epic", "GOG", "Ubisoft", "EA", "Rockstar"] as const;
export type StorefrontKey = typeof STOREFRONT_KEYS[number];

// Metadata for each storefront on ITAD
const STOREFRONTS: Readonly<Record<StorefrontKey, { id: number; match: string }>> = {
  Steam: { id: 61, match: "steam" },
  Epic: { id: 16, match: "epic" },
  GOG: { id: 53, match: "gog" },
  Ubisoft: { id: 62, match: "ubisoft" },
  EA: { id: 52, match: "ea" },
  Rockstar: { id: 501, match: "rockstar" },
};

import { SETTINGS, Setting } from "../utils/Settings";


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
