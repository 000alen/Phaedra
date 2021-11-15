import React from "react";

import { DefaultButton } from "@fluentui/react";

interface PageLayoutSelectorProps {
  id: string;
  onReferencesChange: (...args: any[]) => void;
  onDataChange: (...args: any[]) => void;
}

export function PageLayoutSelector({ id }: PageLayoutSelectorProps) {
  // ! TODO
  return (
    <div>
      <DefaultButton text="Reference" />
      <DefaultButton text="Data" />
      <DefaultButton text="Editor" />
    </div>
  );
}
