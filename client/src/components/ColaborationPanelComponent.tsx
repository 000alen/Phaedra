import React from "react";

import { Label, Panel, PanelType } from "@fluentui/react";

interface IColaborationPanelComponentProps {
  colaborationPanelShown: boolean;
  hideColaborationPanel: () => void;
}

export default function ColaborationPanelComponent({
  colaborationPanelShown,
  hideColaborationPanel: hideTasksPanel,
}: IColaborationPanelComponentProps) {
  return (
    <Panel
      isLightDismiss
      type={PanelType.smallFixedNear}
      isOpen={colaborationPanelShown}
      onDismiss={hideTasksPanel}
    >
      <Label>Colaboration panel!</Label>
    </Panel>
  );
}
