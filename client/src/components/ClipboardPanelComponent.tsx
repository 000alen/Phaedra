import React from "react";

import { Label, Panel, PanelType } from "@fluentui/react";

import { IClipboard } from "../structures/ClipboardStructure";

interface IClipboardPanelComponentProps {
  clipboardPanelShown: boolean;
  hideClipboardPanel: () => void;
  clipboard: IClipboard;
}

export default function ClipboardPanelComponent({
  clipboardPanelShown,
  hideClipboardPanel,
  clipboard,
}: IClipboardPanelComponentProps) {
  return (
    <Panel
      isLightDismiss
      type={PanelType.smallFixedNear}
      isOpen={clipboardPanelShown}
      onDismiss={hideClipboardPanel}
    >
      <Label>Clipboard panel!</Label>
      <div className="space-y-2">
        {clipboard.map((item, index) => (
          <Label key={`clipboardElement${index}`}>{item.type}</Label>
        ))}
      </div>
    </Panel>
  );
}
