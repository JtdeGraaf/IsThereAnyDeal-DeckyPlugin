import { Button, findModuleChild } from 'decky-frontend-lib';
import React, { useEffect, useState } from 'react'
import { PhysicalButton, registerForInputEvent } from './ButtonRegistration';
import { GlobalStates, globalStates } from '../utils/GlobalStates';

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

  

  return (
    <div style={{
      marginLeft: 8,
      marginTop: 8,
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
      transform: `translateY(${appId ? 0 : -150}%)`,
      transition: "transform 0.22s cubic-bezier(0, 0.73, 0.48, 1)",
    }}>
      <Button>{appId}</Button>
    </div> 
  )
}

export default PriceComparison