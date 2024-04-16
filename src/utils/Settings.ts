import { ServerAPI } from "decky-frontend-lib";
import { CACHE } from "./Cache";

export enum Setting {
  ALLOW_VOUCHERS_IN_PRICES = "allowVouchersInPrices",
  COUNTRY = "country"

}

export let SETTINGS: Settings

export class Settings {
  private readonly serverAPI: ServerAPI;

  constructor(serverAPI: ServerAPI) {
    this.serverAPI = serverAPI;
  }

  static init(serverAPI: ServerAPI){
    SETTINGS = new Settings(serverAPI)
  }

  defaults: Record<Setting, any> = {
    allowVouchersInPrices: false,
    country: "US"  //await SteamClient.User.GetIPCountry()
  };

  async load(key: Setting) {
    const cacheValue = await CACHE.loadValue(key)
    if (cacheValue) {
      return cacheValue
    }

    const response = await this.serverAPI.callPluginMethod("settings_load", {
      key: key,
      defaults: this.defaults[key],
    });

    if (response.success) {
        CACHE.setValue(key, response)
        return response.result;
    } else {
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
