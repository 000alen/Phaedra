import {
  DefaultButton,
  CompoundButton,
  PrimaryButton,
  TextField,
} from "@fluentui/react";
import React, { useState } from "react";
import { getApiUrl, setApiUrl } from "../../../API";

export default function BackendView({ statusBarRef }) {
  const [url, setUrl] = useState(getApiUrl());

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
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
        href="https://colab.research.google.com/github/000alen/Phaedra/blob/master/backend/Phaedra.ipynb"
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
