import React from "react";

import { Icon, Text } from "@fluentui/react";

export interface StatusBarButtonComponentProps {
  text: string;
  icon?: string;
}

export function StatusBarButtonComponent({
  text,
  icon,
}: StatusBarButtonComponentProps) {
  return (
    <div className="flex items-center px-1 space-x-1 hover:bg-red-800">
      {icon ? <Icon iconName={icon} /> : null}
      <Text variant="small">{text}</Text>
    </div>
  );
}
