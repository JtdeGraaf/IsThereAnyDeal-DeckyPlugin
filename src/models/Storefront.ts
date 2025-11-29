import { SETTINGS, Setting } from "../utils/Settings";

const STOREFRONT_KEYS = [
    "Steam",
    "Epic",
    "GOG",
    "Ubisoft",
    "EA",
    "Rockstar",
] as const;

export type StorefrontKey = (typeof STOREFRONT_KEYS)[number];

// ITAD metadata
const STOREFRONTS: Readonly<Record<StorefrontKey, { id: number }>> = {
    Steam: { id: 61 },
    Epic: { id: 16 },
    GOG: { id: 53 },
    Ubisoft: { id: 62 },
    EA: { id: 52 },
    Rockstar: { id: 501 },
};


function enabledStorefrontKeys(
    map?: Record<string, boolean>
): StorefrontKey[] {
    return map ? STOREFRONT_KEYS.filter(k => map[k]) : [];
}

async function getEnabledStorefronts(): Promise<StorefrontKey[]> {
    const map = await SETTINGS.load(Setting.STOREFRONTS);
    return enabledStorefrontKeys(map);
}

// Exported API
export const Storefronts = {
    keys: STOREFRONT_KEYS,
    meta: STOREFRONTS,
    getEnabledStorefronts,
};

export default Storefronts;
