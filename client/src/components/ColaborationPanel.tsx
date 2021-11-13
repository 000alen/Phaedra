import React from "react";

import { Label, Panel, PanelType } from "@fluentui/react";

interface ColaborationPanelProps {
  colaborationPanelShown: boolean;
  hideColaborationPanel: () => void;
}

export function ColaborationPanel({
  colaborationPanelShown,
  hideColaborationPanel: hideTasksPanel,
}: ColaborationPanelProps) {
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
