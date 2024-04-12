import { ButtonItem, Menu, MenuItem, PanelSection, PanelSectionRow, ServerAPI, showContextMenu } from 'decky-frontend-lib'
import React from 'react'

interface Props {
    serverAPI: ServerAPI
}

const DeckyMenuOption = ({serverAPI}: Props) => {
    return (
        <PanelSection title="Panel Section">
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={(e) =>
                showContextMenu(
                  <Menu label="Menu" cancelText="CAAAANCEL" onCancel={() => {}}>
                    <MenuItem onSelected={() => {}}>Item #1</MenuItem>
                    <MenuItem onSelected={() => {}}>Item #2</MenuItem>
                    <MenuItem onSelected={() => {}}>Item #3</MenuItem>
                  </Menu>,
                  e.currentTarget ?? window
                )
              }
            >
              Server says yolo
            </ButtonItem>
          </PanelSectionRow>
  
          <PanelSectionRow>
            <div style={{ display: "flex", justifyContent: "center" }}>
              panelsection
            </div>
          </PanelSectionRow>
  
          <PanelSectionRow>
            <ButtonItem>
              Router
            </ButtonItem>
          </PanelSectionRow>
        </PanelSection>
      );
}

export default DeckyMenuOption