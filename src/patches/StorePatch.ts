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

    let ws: WebSocket | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    const cleanup = () => {
        if (ws) {
            ws.close();
            ws = null;
        }
        if (retryTimeout) {
            clearTimeout(retryTimeout);
            retryTimeout = null;
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

    const connectToStoreTab = async (retries = 3) => {
        try {
            // 1. Fetch the list of open tabs (pages)
            const response = await serverApi.fetchNoCors<{ body: string }>('http://localhost:8080/json');
            if (!response.success) throw new Error("Failed to fetch tabs");

            const tabs: Tab[] = JSON.parse(response.result.body) || [];
            const storeTab = tabs.find((tab) => tab.url.includes('https://store.steampowered.com'));

            if (storeTab && storeTab.webSocketDebuggerUrl) {
                // 2. Set the initial state from the current URL
                updateAppIdFromUrl(storeTab.url);

                // 3. Connect to the WebSocket debugger
                if (ws) ws.close();
                ws = new WebSocket(storeTab.webSocketDebuggerUrl);

                ws.onopen = () => {
                    // Enable Page events to get navigation updates
                    ws?.send(JSON.stringify({ id: 1, method: "Page.enable" }));
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        // Listen for navigation events
                        if (data.method === "Page.frameNavigated" && data.params?.frame?.url) {
                            updateAppIdFromUrl(data.params.frame.url);
                        }
                    } catch (e) {
                        console.error("[IsThereAnyDeal Store Patch] Error parsing WS message", e);
                    }
                };

                ws.onclose = () => {
                    // If the store tab closes/crashes, clear the cache
                    CACHE.setValue(CACHE.APP_ID_KEY, "");
                }

            } else if (retries > 0) {
                // Store tab might not be ready yet (e.g. just clicked the tab)
                retryTimeout = setTimeout(() => connectToStoreTab(retries - 1), 1000);
            }
        } catch (e) {
            console.error("[IsThereAnyDeal Store Patch] Error connecting to Store tab:", e);
            if (retries > 0) {
                retryTimeout = setTimeout(() => connectToStoreTab(retries - 1), 1000);
            }
        }
    };

    // Listen to the main Steam Deck router
    const unlisten = History.listen((info) => {
        if (info.pathname === '/steamweb') {
            // We entered the Store view, try to connect to the internal browser
            connectToStoreTab();
        } else {
            // We left the Store view, disconnect everything
            cleanup();
        }
    });

    // Initial check in case we loaded *while* already in the store
    if (History.location?.pathname === '/steamweb') {
        connectToStoreTab();
    }

    return () => {
        cleanup();
        unlisten();
    };
}