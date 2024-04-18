import { DropdownItem, PanelSection, PanelSectionRow, ToggleField } from 'decky-frontend-lib'
import { useEffect, useState } from 'react'
import { SETTINGS, Setting } from '../utils/Settings';
import { countries } from '../models/Country';

const DeckyMenuOption = () => {
  const [allowVouchersInPrices, setAllowVouchersInPrices] = useState(SETTINGS.defaults.allowVouchersInPrices)
  const [country, setCountry] = useState(SETTINGS.defaults.country)

  useEffect(() => {
    SETTINGS.load(Setting.ALLOW_VOUCHERS_IN_PRICES).then(setAllowVouchersInPrices);
    SETTINGS.load(Setting.COUNTRY).then(setCountry)
  }, []);

  const countryOptions = countries.map((country, index) => ({
    data: index,
    label: country.name,
    value: country.alpha2
  } as const))

  return (
        <PanelSection title="Settings">
          <PanelSectionRow>
            <DropdownItem 
              label="Country"
              description="Select a store country"
              rgOptions={countryOptions} 
              selectedOption={countryOptions.find(option => option.value === country)?.data} 
              onChange={(option) => {
                SETTINGS.save(Setting.COUNTRY,
                 countryOptions.find(countryOption => countryOption.data === option.data)?.value)}}>
            </DropdownItem>
          </PanelSectionRow>
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