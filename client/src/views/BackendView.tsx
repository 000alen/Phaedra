import React, { useState } from "react";

import {
  CompoundButton,
  DefaultButton,
  Panel,
  PanelType,
  PrimaryButton,
  TextField,
} from "@fluentui/react";
import { useBoolean } from "@uifabric/react-hooks";

import { getApiUrl, setApiUrl } from "../API/PhaedraAPI";
import { MainPageViewProps } from "../pages/MainPage";
import { strings } from "../resources/strings";

export default function BackendView({ id }: MainPageViewProps) {
  const [url, setUrl] = useState(getApiUrl());

  const handleUrlChange = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string | undefined
  ) => {
    setUrl(newValue!);
  };

  const handleSetUrl = () => {
    setApiUrl(`http://${url}`);
  };

  const textFieldStyles = {
    root: { width: "500px" },
  };

  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] =
    useBoolean(false);

  return (
    <div className="space-y-2">
      <CompoundButton
        primary
        secondaryText="Serve Phaedra's backend from Google Colaboratory"
        href="https://colab.research.google.com/github/000alen/Phaedra/blob/master/Phaedra_LocalMode.ipynb"
        target="_blank"
      >
        Create remote backend
      </CompoundButton>

      <TextField
        label={strings.backendUrlLabel}
        prefix="http://"
        onChange={handleUrlChange}
        styles={textFieldStyles}
        defaultValue={url.slice(7)}
      />

      <div className="flex flex-row align-top space-x-2">
        <PrimaryButton text={strings.setButtonLabel} onClick={handleSetUrl} />
        <DefaultButton text={strings.pingApiButtonLabel} />
      </div>

      <DefaultButton text="Open panel" onClick={openPanel} />
      <Panel
        isLightDismiss
        type={PanelType.smallFixedNear}
        isOpen={isOpen}
        onDismiss={dismissPanel}
        closeButtonAriaLabel="Close"
        headerText="Light dismiss panel"
      >
        <p>Hello, World!</p>
      </Panel>
    </div>
  );
}
