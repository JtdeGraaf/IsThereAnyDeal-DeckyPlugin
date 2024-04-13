import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { FaShip } from "react-icons/fa";


import PriceComparison from "./components/PriceComparison";
import DeckyMenuOption from "./components/DeckyMenuOption";
import { patchStore } from "./patches/StorePatch";
import { GlobalStates } from "./utils/GlobalStates";


export default definePlugin((serverApi: ServerAPI) => {
  
  GlobalStates.init(serverApi)

  serverApi.routerHook.addGlobalComponent("PriceComparison", PriceComparison )

  const storePatch = patchStore(serverApi)


  return {
    title: <div className={staticClasses.Title}>IsThereAnyDeal</div>,
    content: <DeckyMenuOption serverAPI={serverApi}/>,
    icon: <FaShip />,
    onDismount() {
      serverApi.routerHook.removeGlobalComponent("PriceComparison")
      storePatch
    },
  };
});
