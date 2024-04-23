import { DropdownItem, PanelSection, PanelSectionRow, ToggleField } from 'decky-frontend-lib'
import { useEffect, useState } from 'react'
import { SETTINGS, Setting } from '../utils/Settings';
import { countries } from '../models/Country';

const DeckyMenuOption = () => {
  const [allowVouchersInPrices, setAllowVouchersInPrices] = useState(SETTINGS.defaults.allowVouchersInPrices)
  const [country, setCountry] = useState(SETTINGS.defaults.country)
  const [fontSize, setFontSize] = useState(SETTINGS.defaults.fontSize)
  const [paddingBottom, setPaddingBottom] = useState(SETTINGS.defaults.paddingBottom)

  useEffect(() => {
    SETTINGS.load(Setting.ALLOW_VOUCHERS_IN_PRICES).then(setAllowVouchersInPrices);
    SETTINGS.load(Setting.COUNTRY).then(setCountry)
    SETTINGS.load(Setting.FONTSIZE).then(setFontSize)
    SETTINGS.load(Setting.PADDING_BOTTOM).then(setPaddingBottom)
  }, []);

  const countryOptions = countries.map((country, index) => ({
    data: index,
    label: country.name,
    value: country.alpha2
  } as const))

  const fontSizeOptions = [];
  for (let size = 8; size <= 24; size++) {
    fontSizeOptions.push({ data: size, label: `${size}px`, value: size });
  }
  const paddingOptions = [];
  for (let size = 0; size <= 24; size++) {
    paddingOptions.push({ data: size, label: `${size}px`, value: size });
  }


  return (
    <>
        <PanelSection title="Settings">
          <PanelSectionRow>
            <DropdownItem 
              label="Country"
              description="Select a store country"
              rgOptions={countryOptions} 
              selectedOption={countryOptions.find(option => option.value === country)?.data} 
              onChange={(option) => {
                SETTINGS.save(Setting.COUNTRY,
                 countryOptions.find(countryOption => countryOption.data === option.data)?.value)}}
            ></DropdownItem>
          </PanelSectionRow>
          <PanelSectionRow>
            <ToggleField 
              label="Allow vouchers in prices" 
              checked={allowVouchersInPrices}
              onChange={(checked) => {
                SETTINGS.save(Setting.ALLOW_VOUCHERS_IN_PRICES, checked)
              }}
            /></PanelSectionRow>
        </PanelSection>
        <PanelSection title='Customization'>
          <DropdownItem 
            label="Font Size"
            rgOptions={fontSizeOptions} 
            selectedOption={fontSizeOptions.find(option => option.value === fontSize)?.data}
            onChange={(option) => {
              SETTINGS.save(Setting.FONTSIZE, option.data)
            }}
          ></DropdownItem>
          <DropdownItem 
            label="Padding Bottom"
            description="Change how far the text will be from the bottom of the screen"
            rgOptions={paddingOptions} 
            selectedOption={paddingOptions.find(option => option.value === paddingBottom)?.data}
            onChange={(option) => {
              SETTINGS.save(Setting.PADDING_BOTTOM, option.data)
            }}
          ></DropdownItem>
        </PanelSection>
    </>
  );
}

export default DeckyMenuOption