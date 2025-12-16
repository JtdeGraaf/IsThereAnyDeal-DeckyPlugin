import { ServerAPI, findModuleChild } from "decky-frontend-lib"
import { CACHE } from "../utils/Cache"

type Tab = {
    description: string
    devtoolsFrontendUrl: string
    id: string
    title: string
    type: 'page'
    url: string
    webSocketDebuggerUrl: string
}

type Info = {
    hash: string
    key: string
    pathname: string
    search: string
    state: { force: number; url: string }
}

const History: {
    listen: (callback: (info: Info) => void) => () => void;
    location?: Info; 
} = findModuleChild((m) => {
    if (typeof m !== 'object') return undefined
    for (const prop in m) {
        if (m[prop]?.m_history) return m[prop].m_history
    }
})

export function patchStore(serverApi: ServerAPI): () => void {
    if (!History || !History.listen) {
        return () => { CACHE.setValue(CACHE.APP_ID_KEY, ""); };
    }

    let storeWebSocket: WebSocket | null = null;
    let retryTimer: NodeJS.Timeout | null = null;

    // Disconnect/teardown helper - closes websocket and clears timers/cache
    const disconnectStoreDebugger = () => {
        if (storeWebSocket) {
            storeWebSocket.close();
            storeWebSocket = null;
        }
        if (retryTimer) {
            clearTimeout(retryTimer);
            retryTimer = null;
        }
        CACHE.setValue(CACHE.APP_ID_KEY, "");
    };

    const updateAppIdFromUrl = (url: string) => {
        if (url.includes('https://isthereanydeal.com')) {
            CACHE.setValue(CACHE.APP_ID_KEY, "");
            return;
        }

        if (url.includes('https://store.steampowered.com')) {
            const appId = url.match(/\/app\/([\d]+)\/?/)?.[1];
            if (appId) {
                CACHE.setValue(CACHE.APP_ID_KEY, appId);
            }
            else {
                CACHE.setValue(CACHE.APP_ID_KEY, "");
            }
        } else {
            CACHE.setValue(CACHE.APP_ID_KEY, "");
        }
    };

    // Attempt to attach to the Steam store tab's debugger websocket and listen for navigation events (URL changes)
    const connectToStoreDebugger = async (retries = 3) => {
        try {
            // 1. Fetch the list of open tabs (pages)
            const response = await serverApi.fetchNoCors<{ body: string }>('http://localhost:8080/json');
            if (!response.success) {
                console.error("[IsThereAnyDeal Store Patch] Failed to fetch tabs (fetchNoCors returned success=false)");
                if (retries > 0) {
                    retryTimer = setTimeout(() => connectToStoreDebugger(retries - 1), 1000);
                }
                return;
            }

            const tabs: Tab[] = JSON.parse(response.result.body) || [];
            const storeTab = tabs.find((tab) => tab.url.includes('https://store.steampowered.com'));

            if (storeTab && storeTab.webSocketDebuggerUrl) {
                // 2. Set the initial state from the current URL
                updateAppIdFromUrl(storeTab.url);

                // 3. Connect to the WebSocket debugger
                if (storeWebSocket) storeWebSocket.close();
                storeWebSocket = new WebSocket(storeTab.webSocketDebuggerUrl);

                storeWebSocket.onopen = () => {
                    // 4. Enable Page events to get navigation updates
                    storeWebSocket?.send(JSON.stringify({ id: 1, method: "Page.enable" }));
                };

                storeWebSocket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        // 5. Listen for navigation events and update the app ID if the URL changes
                        if (data.method === "Page.frameNavigated" && data.params?.frame?.url) {
                            updateAppIdFromUrl(data.params.frame.url);
                        }
                    } catch (e) {
                        console.error("[IsThereAnyDeal Store Patch] Error parsing WS message", e);
                    }
                };

                storeWebSocket.onclose = () => {
                    // If the store tab closes/crashes, clear the cache
                    CACHE.setValue(CACHE.APP_ID_KEY, "");
                }

            } else if (retries > 0) {
                // Store tab might not be ready yet - retry up to `retries` times
                retryTimer = setTimeout(() => connectToStoreDebugger(retries - 1), 1000);
            }
        } catch (e) {
            console.error("[IsThereAnyDeal Store Patch] Error connecting to Store tab:", e);
            if (retries > 0) {
                retryTimer = setTimeout(() => connectToStoreDebugger(retries - 1), 1000);
            }
        }
    };

    // Start listening to the Steam Deck router. The returned function unsubscribes the listener.
    // We subscribe on module init and only connect to the internal webview debugger while the
    // deck's router reports the `/steamweb` path. When we leave that path we disconnect.
    const stopHistoryListener = History.listen((info) => {
        // Only connect when the user is viewing the internal web view for the store
        if (info.pathname === '/steamweb') {
            // We entered the Store view, try to connect to the internal browser debugger
            connectToStoreDebugger();
        } else {
            // We left the Store view, disconnect everything
            disconnectStoreDebugger();
        }
    });

    // Initial check in case we loaded while already in the store
    if (History.location?.pathname === '/steamweb') {
        connectToStoreDebugger();
    }

    // Return teardown for the patch: disconnect debugger and stop listening to history
    return () => {
        disconnectStoreDebugger();
        stopHistoryListener();
    };
}