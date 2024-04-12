import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { FaShip } from "react-icons/fa";


import PriceComparison from "./components/PriceComparison";
import DeckyMenuOption from "./components/DeckyMenuOption";


export default definePlugin((serverApi: ServerAPI) => {

  serverApi.routerHook.addGlobalComponent("PriceComparison", PriceComparison )

  return {
    title: <div className={staticClasses.Title}>IsThereAnyDeal</div>,
    content: <DeckyMenuOption serverAPI={serverApi}/>,
    icon: <FaShip />,
    onDismount() {
      serverApi.routerHook.removeGlobalComponent("PriceComparison")
    },
  };
});
