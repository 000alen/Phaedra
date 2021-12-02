import { DefaultButton } from "@fluentui/react";
import React from "react";

export function PagePaneSelector() {
  return (
    <div>
      <DefaultButton text="Reference" />
      <DefaultButton text="Quill" />
      <DefaultButton text="Content" />
    </div>
  );
}
