import { ButtonItem, Dropdown, Menu, MenuItem, PanelSection, PanelSectionRow, ServerAPI, showContextMenu } from 'decky-frontend-lib'
import React from 'react'

interface Props {
    serverAPI: ServerAPI
}

const DeckyMenuOption = ({serverAPI}: Props) => {
    return (
        <PanelSection title="Settings">
          <PanelSectionRow>
          </PanelSectionRow>
        </PanelSection>
      );
}

export default DeckyMenuOption