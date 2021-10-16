import React from "react";
import { Spinner, SpinnerSize, Text } from "@fluentui/react";

export function StatusBarLoadingComponent({ text }) {
  return (
    <div className="flex items-center space-x-2">
      <Spinner size={SpinnerSize.xSmall} />
      <Text variant="small">{text}</Text>
    </div>
  );
}
