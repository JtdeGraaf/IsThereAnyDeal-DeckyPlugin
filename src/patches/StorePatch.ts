import { findModuleChild } from "decky-frontend-lib"
import { CACHE } from "../utils/Cache"

// most of the below is stolen from https://github.com/OMGDuke/protondb-decky/tree/28/store-injection

type Info = {
    hash: string
    key: string
    pathname: string
    search: string
    state: { force: number; url: string }
}

const History: {
    listen: (callback: (info: Info) => Promise<void>) => () => void
} = findModuleChild((m) => {
    if (typeof m !== 'object') return undefined
    for (const prop in m) {
        if (m[prop]?.m_history) return m[prop].m_history
    }
})

export function patchStore(): () => void {
    if (History && History.listen) {
        const unlisten = History.listen(async (info) => {
            try {
                // The router 'info' object usually contains the current URL in 'state.url' when the pathname is '/steamweb'
                if (info.pathname === '/steamweb' && info.state?.url) {
                    const url = info.state.url;

                    // Ensure we are strictly on the steam store before parsing
                    if (url.includes('https://store.steampowered.com')) {
                        const appId = url.match(/\/app\/([\d]+)\/?/)?.[1];
                        if (appId) {
                            CACHE.setValue(CACHE.APP_ID_KEY, appId);
                            return;
                        }
                    }
                }

                // If we are not on /steamweb or the URL doesn't match an app, clear the ID
                CACHE.setValue(CACHE.APP_ID_KEY, "");
            } catch (err) {
                CACHE.setValue(CACHE.APP_ID_KEY, "");
            }
        });

        return () => {
            unlisten();
        };
    }

    return () => {
        CACHE.setValue(CACHE.APP_ID_KEY, "");
    };
}