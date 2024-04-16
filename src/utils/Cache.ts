
export let CACHE: Cache

export class Cache {
  public readonly APP_ID_KEY = "APP_ID"

  constructor() {
    
  }

  static init() {
    CACHE = new Cache();
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

  async loadValue(key: string) {
    if (this.cache[key]) {
      console.log("LOAD RESULT: " + this.cache[key])
      return this.cache[key];
    }
  }

  async setValue(key: string, value: any) {
    this.cache[key] = value;
    this.notifySubscribers();
  }

}
