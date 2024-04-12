import { Button, findModuleChild } from 'decky-frontend-lib';
import React, { useEffect, useState } from 'react'
import { PhysicalButton, registerForInputEvent } from './ButtonRegistration';

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

  const [label, setLabel] = useState("NOT PRESSED")

  useEffect(() => {
    const registration =
      registerForInputEvent(
        (buttons, event) => {
          if(buttons.includes(PhysicalButton.START) && buttons.includes(PhysicalButton.SELECT)){
            setLabel("PRESSED!!!!")
          }
        }
      );

    return () => {
      registration.unregister();
    };
  }, []);

  useUIComposition(UIComposition.Notification)

  return (
    <div style={{
      zIndex:7002
    }}>
      <Button  onClick={() => {useUIComposition(UIComposition.Hidden)}}>{label}</Button>
    </div>
  )
}

export default PriceComparison