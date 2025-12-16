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

    // State flag to track if we are in the store.
    // This helps prevent race conditions where a WS message arrives after we left.
    let isStoreMounted = false;

    // Disconnect/teardown helper
    const disconnectStoreDebugger = () => {
        isStoreMounted = false; // Mark as inactive immediately

        if (storeWebSocket) {
            // Remove listeners to prevent any pending messages from firing
            storeWebSocket.onopen = null;
            storeWebSocket.onmessage = null;
            storeWebSocket.onclose = null;
            storeWebSocket.close();
            storeWebSocket = null;
        }
        if (retryTimer) {
            clearTimeout(retryTimer);
            retryTimer = null;
        }
        // Force clear the cache
        CACHE.setValue(CACHE.APP_ID_KEY, "");
    };

    const updateAppIdFromUrl = (url: string) => {
        // Guard: If we've already left the store view, do not update the url, as it may cause the PriceComparison component to render on none store screens
        if (!isStoreMounted) {
            CACHE.setValue(CACHE.APP_ID_KEY, "");
            return;
        }

        if (url.includes('https://isthereanydeal.com')) {
            CACHE.setValue(CACHE.APP_ID_KEY, "");
            return;
        }

        if (!url.includes('https://store.steampowered.com')) {
            CACHE.setValue(CACHE.APP_ID_KEY, "");
            return;
        }

        const appId = url.match(/\/app\/([\d]+)\/?/)?.[1];
        CACHE.setValue(CACHE.APP_ID_KEY, appId ?? "");
    };

    const connectToStoreDebugger = async (retries = 3) => {
        // Stop if we navigated away during the async wait
        if (!isStoreMounted) {
            CACHE.setValue(CACHE.APP_ID_KEY, "");
            return;
        }

        try {
            // 1. Fetch the tabs
            const response = await serverApi.fetchNoCors<{ body: string }>('http://localhost:8080/json');
            if (!response.success) {
                if (retries > 0 && isStoreMounted) {
                    retryTimer = setTimeout(() => connectToStoreDebugger(retries - 1), 1000);
                    return;
                }
                CACHE.setValue(CACHE.APP_ID_KEY, "");
                return;
            }

            const tabs: Tab[] = JSON.parse(response.result.body) || [];
            const storeTab = tabs.find((tab) => tab.url.includes('https://store.steampowered.com'));

            // Early return if no store tab / websocket
            if (!storeTab || !storeTab.webSocketDebuggerUrl) {
                if (retries > 0 && isStoreMounted) {
                    retryTimer = setTimeout(() => connectToStoreDebugger(retries - 1), 1000);
                    return;
                }
                CACHE.setValue(CACHE.APP_ID_KEY, "");
                return;
            }

            // 2. Update the appId from the current URL
            updateAppIdFromUrl(storeTab.url);

            // 3. Connect to the websocket debugger to listen for navigation events
            if (storeWebSocket) {
                storeWebSocket.close();
            }
            storeWebSocket = new WebSocket(storeTab.webSocketDebuggerUrl);

            storeWebSocket.onopen = () => {
                if (!isStoreMounted) {
                    storeWebSocket?.close();
                    CACHE.setValue(CACHE.APP_ID_KEY, "");
                    return;
                }
                storeWebSocket?.send(JSON.stringify({ id: 1, method: "Page.enable" }));
            };

            storeWebSocket.onmessage = (event) => {
                if (!isStoreMounted) {
                    CACHE.setValue(CACHE.APP_ID_KEY, "");
                    return; // Ignore messages if we aren't in the store view
                }

                try {
                    const data = JSON.parse(event.data);
                    // If a page navigation event is received, update the appId from the url
                    if (data.method === "Page.frameNavigated" && data.params?.frame?.url) {
                        updateAppIdFromUrl(data.params.frame.url);
                    }
                } catch (e) {
                    CACHE.setValue(CACHE.APP_ID_KEY, "");
                }
            };

            storeWebSocket.onclose = () => {
                if (isStoreMounted) {
                    CACHE.setValue(CACHE.APP_ID_KEY, "");
                }
            }

        } catch (e) {
            if (retries > 0 && isStoreMounted) {
                retryTimer = setTimeout(() => connectToStoreDebugger(retries - 1), 1000);
                return;
            }
            CACHE.setValue(CACHE.APP_ID_KEY, "");
            return;
        }
    };

    // Central handler for routing state changes
    const handleLocationChange = (pathname: string) => {
        if (pathname === '/steamweb') {
            if (!isStoreMounted) {
                isStoreMounted = true;
                connectToStoreDebugger();
            }
        }
        else {
            if (isStoreMounted) {
                disconnectStoreDebugger();
            }
        }
    };

    // Listen to steamdeck router events, for example, fires when a user navigates from the library screen to the store screen.
    const stopHistoryListener = History.listen((info) => {
        handleLocationChange(info.pathname);
    });


    // Initial Check
    if (History.location) {
        handleLocationChange(History.location.pathname);
    }

    // Return the teardown function
    return () => {
        disconnectStoreDebugger();
        stopHistoryListener();
    };
}