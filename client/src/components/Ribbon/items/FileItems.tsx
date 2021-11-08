import React from "react";

import { CommandBar, ICommandBarItemProps } from "@fluentui/react";

export default function FileItems() {
  const fileItems: ICommandBarItemProps[] = [];

  return <CommandBar items={fileItems} />;
}
