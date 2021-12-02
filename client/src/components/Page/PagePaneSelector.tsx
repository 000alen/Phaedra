import { DefaultButton } from "@fluentui/react";
import React from "react";

export interface PagePaneSelectorProps {
  setPaneType: (type: string) => void;
}

export function PagePaneSelector({ setPaneType }: PagePaneSelectorProps) {
  return (
    <div>
      <DefaultButton
        text="Reference"
        onClick={() => setPaneType("reference")}
      />
      <DefaultButton text="Quill" onClick={() => setPaneType("quill")} />
      <DefaultButton text="Content" onClick={() => setPaneType("default")} />
      <DefaultButton text="Void" onClick={() => setPaneType("void")} />
    </div>
  );
}
