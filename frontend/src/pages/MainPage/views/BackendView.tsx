import React, { useState } from "react";
import {
  DefaultButton,
  CompoundButton,
  PrimaryButton,
  TextField,
} from "@fluentui/react";

import { getApiUrl, setApiUrl } from "../../../API/PhaedraAPI";

interface BackendViewProps {
  id: string;
}

export default function BackendView({ id }: BackendViewProps) {
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

  return (
    <div className="space-y-2">
      <CompoundButton
        primary
        secondaryText="Serve Phaedra's backend from Google Colaboratory"
        href="https://colab.research.google.com/github/000alen/Phaedra/blob/master/backend/Phaedra_LocalMode.ipynb"
        target="_blank"
      >
        Create remote backend
      </CompoundButton>

      <TextField
        label="Backend URL"
        prefix="http://"
        onChange={handleUrlChange}
        styles={textFieldStyles}
        defaultValue={url.slice(7)}
      />

      <div className="flex flex-row align-top space-x-2">
        <PrimaryButton text="Set" onClick={handleSetUrl} />
        <DefaultButton text="Ping API (beacon)" />
      </div>
    </div>
  );
}
