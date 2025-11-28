import { useSettings } from '../hooks/useSettings'
import { DropdownItem, PanelSection, PanelSectionRow, ToggleField } from 'decky-frontend-lib'
import { countries } from '../models/Country';

const DeckyMenuOption = () => {
  const {
    allowVouchersInPrices,
    saveVouchers,
    country,
    saveCountry,
    fontSize,
    saveFontSize,
    paddingBottom,
    savePaddingBottom,
    storefronts,
    toggleStorefront,
    storefrontKeys
  } = useSettings();

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
                const val = countryOptions.find(countryOption => countryOption.data === option.data)?.value
                saveCountry(val || country)
              }}
            ></DropdownItem>
          </PanelSectionRow>
          <PanelSectionRow>
            <ToggleField 
              label="Allow vouchers in prices" 
              checked={allowVouchersInPrices}
              onChange={(checked) => saveVouchers(checked)}
            /></PanelSectionRow>
        </PanelSection>
        <PanelSection title='Customization'>
          <DropdownItem 
            label="Font Size"
            rgOptions={fontSizeOptions} 
            selectedOption={fontSizeOptions.find(option => option.value === fontSize)?.data}
            onChange={(option) => saveFontSize(option.data)}
          ></DropdownItem>
          <DropdownItem 
            label="Padding Bottom"
            description="Change how far the text will be from the bottom of the screen"
            rgOptions={paddingOptions} 
            selectedOption={paddingOptions.find(option => option.value === paddingBottom)?.data}
            onChange={(option) => savePaddingBottom(option.data)}
          ></DropdownItem>
        </PanelSection>
        <PanelSection title='Storefronts'>
          {storefrontKeys.map((key) => (
            <PanelSectionRow key={`sf-${key}`}>
              <ToggleField
                label={key}
                checked={storefronts[key]}
                onChange={(checked) => toggleStorefront(key, checked)}
              />
            </PanelSectionRow>
          ))}
        </PanelSection>
    </>
  );
}

export default DeckyMenuOption