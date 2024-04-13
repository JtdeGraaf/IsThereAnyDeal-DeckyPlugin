import { ServerAPI } from "decky-frontend-lib";

export let globalStates: GlobalStates

export class GlobalStates {
  private readonly serverAPI: ServerAPI;

  private readonly appIdKey = "APP_ID"

  constructor(serverAPI: ServerAPI) {
    this.serverAPI = serverAPI;
  }

  static init(serverAPI: ServerAPI) {
    globalStates = new GlobalStates(serverAPI);
  }

  private cache: Partial<Record<string, any>> = {};
  private subscribers: Map<string, () => void> = new Map();


  subscribe(id: string, callback: () => void): void {
    this.subscribers.set(id, callback);
  }

  unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  notifySubscribers() {
    for (const callback of this.subscribers.values()) {
      callback();
    }
  }

  async loadAppId() {
    if (this.cache[this.appIdKey]) {
      return this.cache[this.appIdKey];
    }

    const response = await this.serverAPI.callPluginMethod("settings_load", {
      key: this.appIdKey,
      defaults: "",
    });

    if (response.success) {
      return (this.cache[this.appIdKey] = response.result);
    } else {
      return "";
    }
  }

  async setAppId(appId: string) {
    this.cache[this.appIdKey] = appId;
    this.notifySubscribers();

    await this.serverAPI.callPluginMethod("settings_save", {
      key: this.appIdKey,
      value: appId,
    });
  }

}
