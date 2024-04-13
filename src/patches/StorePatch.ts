import { ServerAPI, findModuleChild } from "decky-frontend-lib"
import { globalStates } from "../utils/GlobalStates"

// All of the below is mindleslly stolen from https://github.com/OMGDuke/protondb-decky/tree/28/store-injection

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
    listen: (callback: (info: Info) => Promise<void>) => () => void
  } = findModuleChild((m) => {
    if (typeof m !== 'object') return undefined
    for (const prop in m) {
      if (m[prop]?.m_history) return m[prop].m_history
    }
  })

/**
 * Stolen from puppeteer util.js/ts
 * @internal
 */
export const evaluationString = (
    fun: string | (() => void),
    ...args: unknown[]
  ): string => {
    if (typeof fun === 'string') {
      if (args.length !== 0)
        throw new Error('Cannot evaluate a string with arguments')
      return fun
    }
    function serializeArgument(arg: unknown) {
      if (Object.is(arg, undefined)) {
        return 'undefined'
      }
      return JSON.stringify(arg)
    }
    return `(${fun})(${args.map(serializeArgument).join(',')})`
  }



export function patchStore(serverApi: ServerAPI): () => void {
    const unlisten = History.listen(async (info) => {
      try {
        // Start the process if we navigate to the steam web browser
        if (info.pathname === '/steamweb') {
          let oldUrl = ""
          const getCurrentAppID = async () =>{
            console.log("FETCHING APPID")

              // get the currently running tabs
            const response = await serverApi.fetchNoCors<{ body: string }>(
              'http://localhost:8080/json'
            )
    
            let tabs: Tab[] = []
            if (response.success) tabs = JSON.parse(response.result.body) || []
            // Find the tab the store is running on
            const tab = tabs.find((t) =>
              t.url.includes('https://store.steampowered.com')
            )
            if (tab?.url && tab.url !== oldUrl) {
              const appId = tab.url.match(/\/app\/([\d]+)\/?/)?.[1]
              if (appId) {

                console.log("APPID: " + appId)
                globalStates.setAppId(appId)
              }
              else globalStates.setAppId("")
            }
            else {
              globalStates.setAppId("")
            }
            getCurrentAppID()
          }
          getCurrentAppID()
        }
        else {
          globalStates.setAppId("")
        }
      } catch (err) {
        globalStates.setAppId("")
      }
    })
    return unlisten
  }
  