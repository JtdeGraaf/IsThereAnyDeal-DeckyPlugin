import { PanelSection, PanelSectionRow, ServerAPI, ToggleField } from 'decky-frontend-lib'
import { useEffect, useState } from 'react'
import { SETTINGS, Setting } from '../utils/Settings';

interface Props {
    serverAPI: ServerAPI
}

const DeckyMenuOption = ({serverAPI}: Props) => {
  const [allowVouchersInPrices, setAllowVouchersInPrices] = useState(SETTINGS.defaults.allowVouchersInPrices)

  useEffect(() => {
    SETTINGS.load(Setting.ALLOW_VOUCHERS_IN_PRICES).then(setAllowVouchersInPrices);
  }, []);


  return (
        <PanelSection title="Settings">
          <PanelSectionRow>
            <ToggleField 
              label="Allow vouchers in prices" 
              checked={allowVouchersInPrices}
              onChange={(checked) => {
                SETTINGS.save(Setting.ALLOW_VOUCHERS_IN_PRICES, checked)
              }}
            />
          </PanelSectionRow>
        </PanelSection>
    );
}

export default DeckyMenuOption