import React from "react";

import { DefaultButton } from "@fluentui/react";

interface PageLayoutSelectorProps {
  id: string;
}

export function PageLayoutSelector({ id }: PageLayoutSelectorProps) {
  return (
    <div>
      <DefaultButton text="Reference" />
      <DefaultButton text="Editor" />
    </div>
  );
}
