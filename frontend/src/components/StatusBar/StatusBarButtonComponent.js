import React from "react";
import { Text, Icon } from "@fluentui/react";

/**
 *
 * @param {Object} props
 * @param {string} props.text
 * @param {string} [props.icon]
 * @returns
 */
export function StatusBarButtonComponent({ text, icon }) {
  return (
    <div className="flex items-center px-1 space-x-1 hover:bg-red-800">
      {icon ? <Icon iconName={icon} /> : null}
      <Text variant="small">{text}</Text>
    </div>
  );
}
