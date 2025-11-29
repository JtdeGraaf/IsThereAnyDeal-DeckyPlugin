import { useEffect, useState } from "react";
import { SETTINGS, Setting } from "../utils/Settings";
import Storefronts, { StorefrontKey } from "../models/Storefront";

export function useSettings() {
  const [allowVouchersInPrices, setAllowVouchersInPrices] = useState<boolean>(SETTINGS.defaults.allowVouchersInPrices);
  const [country, setCountry] = useState<string>(SETTINGS.defaults.country);
  const [fontSize, setFontSize] = useState<number>(SETTINGS.defaults.fontSize);
  const [paddingBottom, setPaddingBottom] = useState<number>(SETTINGS.defaults.paddingBottom);
  const STEAM_ONLY_DEFAULT: Record<StorefrontKey, boolean> = { Steam: true, Epic: false, GOG: false, Ubisoft: false, EA: false, Rockstar: false };
  const [storefronts, setStorefronts] = useState<Record<StorefrontKey, boolean>>(STEAM_ONLY_DEFAULT);

  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      const loadedVouchers = await SETTINGS.load(Setting.ALLOW_VOUCHERS_IN_PRICES);
      if (!mounted) return;
      setAllowVouchersInPrices(Boolean(loadedVouchers));

      const loadedCountry = await SETTINGS.load(Setting.COUNTRY);
      if (!mounted) return;
      if (loadedCountry) setCountry(String(loadedCountry));

      const loadedFontSize = await SETTINGS.load(Setting.FONTSIZE);
      if (!mounted) return;
      if (loadedFontSize) setFontSize(Number(loadedFontSize));

      const loadedPaddingBottom = await SETTINGS.load(Setting.PADDING_BOTTOM);
      if (!mounted) return;
      if (loadedPaddingBottom) setPaddingBottom(Number(loadedPaddingBottom));

      const loadedStorefronts = await SETTINGS.load(Setting.STOREFRONTS);
      if (!mounted) return;
      if (loadedStorefronts && typeof loadedStorefronts === "object") {
        setStorefronts(loadedStorefronts as Record<StorefrontKey, boolean>);
      }
    }

    loadAll();
    return () => { mounted = false };
  }, []);

  const saveVouchers = (v: boolean) => {
    setAllowVouchersInPrices(v);
    SETTINGS.save(Setting.ALLOW_VOUCHERS_IN_PRICES, v);
  }

  const saveCountry = (c: string) => {
    setCountry(c);
    SETTINGS.save(Setting.COUNTRY, c);
  }

  const saveFontSize = (s: number) => {
    setFontSize(s);
    SETTINGS.save(Setting.FONTSIZE, s);
  }

  const savePaddingBottom = (p: number) => {
    setPaddingBottom(p);
    SETTINGS.save(Setting.PADDING_BOTTOM, p);
  }

  const toggleStorefront = (key: StorefrontKey, checked: boolean) => {
    const newMap = { ...storefronts, [key]: checked };
    setStorefronts(newMap);
    SETTINGS.save(Setting.STOREFRONTS, newMap);
  }

  return {
    allowVouchersInPrices,
    saveVouchers,
    country,
    saveCountry,
    fontSize,
    saveFontSize,
    paddingBottom,
    savePaddingBottom,
    storefronts,
    toggleStorefront,
    storefrontKeys: Storefronts.keys
  }
}
