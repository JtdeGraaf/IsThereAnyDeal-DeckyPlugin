import { findModuleChild } from "decky-frontend-lib"
import { CACHE } from "../utils/Cache"

const LOG_PREFIX = '[IsThereAnyDeal:StorePatch]'

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
    console.log(`${LOG_PREFIX} patchStore() called`)
    if (History && History.listen) {
        console.log(`${LOG_PREFIX} History.listen available - attaching listener`)
        const unlisten = History.listen(async (info) => {
            try {
                console.log(`${LOG_PREFIX} navigation event`, { pathname: info?.pathname, url: info?.state?.url })
                // The router 'info' object usually contains the current URL in 'state.url' when the pathname is '/steamweb'
                if (info.pathname === '/steamweb' && info.state?.url) {
                    const url = info.state.url;

                    // Ensure we are strictly on the steam store before parsing
                    if (url.includes('https://store.steampowered.com')) {
                        const appId = url.match(/\/app\/([\d]+)\/?/)?.[1];
                        if (appId) {
                            console.log(`${LOG_PREFIX} Detected appId: ${appId} - setting CACHE`)
                            CACHE.setValue(CACHE.APP_ID_KEY, appId);
                            return;
                        } else {
                            console.log(`${LOG_PREFIX} URL on steam web but no appId found in URL`, { url })
                        }
                    } else {
                        console.log(`${LOG_PREFIX} state.url present but not a steam store URL`, { url })
                    }
                } else {
                    console.log(`${LOG_PREFIX} Not on /steamweb or state.url missing`, { pathname: info.pathname, stateUrl: info.state?.url })
                }

                // If we are not on /steamweb or the URL doesn't match an app, clear the ID
                console.log(`${LOG_PREFIX} Clearing CACHE.APP_ID_KEY`)
                CACHE.setValue(CACHE.APP_ID_KEY, "");
            } catch (err) {
                console.error(`${LOG_PREFIX} Error in History.listen handler`, err)
                CACHE.setValue(CACHE.APP_ID_KEY, "");
            }
        });

        return () => {
            console.log(`${LOG_PREFIX} Unlistening history events`)
            unlisten();
        };
    }

    console.log(`${LOG_PREFIX} History or History.listen not found - returning cleanup that clears CACHE`)
    return () => {
        CACHE.setValue(CACHE.APP_ID_KEY, "");
    };
}