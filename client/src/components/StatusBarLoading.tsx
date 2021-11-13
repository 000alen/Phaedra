import React from "react";

import { Spinner, SpinnerSize, Text } from "@fluentui/react";

export interface StatusBarLoadingProps {
  text: string;
  onShowTasksPanel: () => void;
}

export function StatusBarLoading({
  text,
  onShowTasksPanel,
}: StatusBarLoadingProps) {
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
