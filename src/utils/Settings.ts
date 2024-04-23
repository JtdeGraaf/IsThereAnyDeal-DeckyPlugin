import { ServerAPI, staticClasses } from "decky-frontend-lib";
import { CACHE } from "./Cache";

export enum Setting {
  ALLOW_VOUCHERS_IN_PRICES = "allowVouchersInPrices",
  COUNTRY = "country",
  FONTSIZE = "fontSize",
  PADDING_BOTTOM = "paddingBottom",

}

export let SETTINGS: Settings

export class Settings {
  private readonly serverAPI: ServerAPI;
  public defaults: Record<Setting, any> = {
    allowVouchersInPrices: false,
    country: "US",
    fontSize: 16,
    paddingBottom: 10,
  };

  constructor(serverAPI: ServerAPI) {
    this.serverAPI = serverAPI;
  }

  static init(serverAPI: ServerAPI){
    SETTINGS = new Settings(serverAPI)
  }

  async load(key: Setting) {
    const cacheValue = await CACHE.loadValue(key)
    if (cacheValue) {
      return cacheValue
    }

    const response = await this.serverAPI.callPluginMethod("settings_load", {
      key: key,
    });

    if (response.success) {
        CACHE.setValue(key, response.result)
        return response.result;
    } else {
        if(key === Setting.COUNTRY){
            const actualDefaultCountry = await SteamClient.User.GetIPCountry()
            this.save(Setting.COUNTRY, actualDefaultCountry)
            return actualDefaultCountry
        }
        return this.defaults[key];
    }
  }

  async save(key: Setting, value: any) {
    CACHE.setValue(key, value)

    await this.serverAPI.callPluginMethod("settings_save", {
      key: key,
      value: value,
    });
  }
}
