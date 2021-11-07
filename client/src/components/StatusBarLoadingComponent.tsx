import React from "react";

import { Spinner, SpinnerSize, Text } from "@fluentui/react";

export interface StatusBarLoadingComponentProps {
  text: string;
  onShowTasksPanel: () => void;
}

export function StatusBarLoadingComponent({
  text,
  onShowTasksPanel,
}: StatusBarLoadingComponentProps) {
  return (
    <div
      className="flex items-center space-x-2"
      onClick={() => onShowTasksPanel()}
    >
      <Spinner size={SpinnerSize.xSmall} />
      <Text variant="small">{text}</Text>
    </div>
  );
}
