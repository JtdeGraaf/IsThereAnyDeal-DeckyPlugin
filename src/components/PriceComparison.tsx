import { findModuleChild } from 'decky-frontend-lib';
import { useEffect, useState } from 'react'
import { globalStates } from '../utils/GlobalStates';
import { isThereAnyDealService } from '../service/IsThereAnyDealService';

enum UIComposition {
  Hidden = 0,
  Notification = 1,
  Overlay = 2,
  Opaque = 3,
  OverlayKeyboard = 4,
}

const useUIComposition: (composition: UIComposition) => void = findModuleChild(
  (m) => {
    if (typeof m !== "object") return undefined;
    for (let prop in m) {
      if (
        typeof m[prop] === "function" &&
        m[prop].toString().includes("AddMinimumCompositionStateRequest") &&
        m[prop].toString().includes("ChangeMinimumCompositionStateRequest") &&
        m[prop].toString().includes("RemoveMinimumCompositionStateRequest") &&
        !m[prop].toString().includes("m_mapCompositionStateRequests")
      ) {
        return m[prop];
      }
    }
  }
);


const PriceComparison = () => {
  const [appId, setAppid] = useState()
  const [label, setLabel] = useState("")
  useUIComposition(appId ? UIComposition.Notification : UIComposition.Hidden)

  useEffect(() => {
    function loadAppId() {
      globalStates.loadAppId().then(setAppid);
    }

    loadAppId();
    globalStates.subscribe("PriceComparison", loadAppId);

    return () => {
      globalStates.unsubscribe("PriceComparison");
    };
  }, []);

  useEffect(() => {
    if(appId){
      isThereAnyDealService.getBestDealForSteamAppId( appId).then((id) => setLabel(id))
    }

  }, [appId])

  

  return (
    <div style={{
      width: 236,
      background: "23262e",
      color: "ffffff",
      boxShadow: "0px 0px 10px rgb(0 0 0 / 50%)" ,
      display: "flex",
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
      flexWrap: "nowrap",
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 7,
      paddingBottom: 7,
      zIndex: 7002, // volume bar is 7000
      position: "fixed",
      bottom: 0, // position at the bottom of the screen
      left: '50%', // position at the middle of the screen
      transform: `translateX(-50%) translateY(${appId ? 0 : 100}%)`, // center the div and move it up or down based on appId
      transition: "transform 0.22s cubic-bezier(0, 0.73, 0.48, 1)",
    }}>
      {label}
    </div> 
  )
  
}

export default PriceComparison