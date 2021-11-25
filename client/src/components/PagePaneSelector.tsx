import React from "react";

import { DefaultButton } from "@fluentui/react";

export function PagePaneSelector() {
  return (
    <div>
      <DefaultButton text="Reference" />
      <DefaultButton text="Data" />
      <DefaultButton text="Editor" />
    </div>
  );
}
