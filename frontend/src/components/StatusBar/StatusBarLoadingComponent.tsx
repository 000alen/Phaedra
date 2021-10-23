import React from "react";

import { Spinner, SpinnerSize, Text } from "@fluentui/react";

import { StatusBarLoadingComponentProps } from "./IStatusBarLoadingComponent";

export function StatusBarLoadingComponent({
  text,
}: StatusBarLoadingComponentProps) {
  return (
    <div className="flex items-center space-x-2">
      <Spinner size={SpinnerSize.xSmall} />
      <Text variant="small">{text}</Text>
    </div>
  );
}
