import React from "react";

import { IconButton } from "@fluentui/react";

import { theme } from "../resources/theme";
import { removeTab, selectTab } from "../structures/TabsStructure";

export interface TabComponentProps {
  id: string;
  title: string;
  active: boolean;
  onAction: Function;
}

export const iconButtonStyles = {
  rootHovered: {
    backgroundColor: "transparent",
  },
  rootPressed: {
    backgroundColor: "transparent",
  },
};

export function TabComponent({
  id,
  title,
  active,
  onAction,
}: TabComponentProps) {
  const handleSelect = () => {
    onAction(selectTab, { id: id });
  };

  const handleClose = () => {
    onAction(removeTab, { id: id });
  };

  const tabStyle = { backgroundColor: theme.palette.neutralPrimary };
  const textStyle = { color: theme.palette.white };
  const cancelIcon = {
    iconName: "Cancel",
    styles: {
      root: { color: theme.palette.white },
    },
  };

  const activeTabStyle = { backgroundColor: theme.palette.themePrimary };
  const activeTextStyle = { color: theme.palette.white };
  const activeCancelIcon = {
    iconName: "Cancel",
    styles: {
      root: { color: theme.palette.white },
    },
  };

  return (
    <div
      className={`pl-2 mr-2 rounded-sm flex items-center`}
      style={active ? activeTabStyle : tabStyle}
    >
      <div
        className={`font-medium`}
        onClick={handleSelect}
        style={active ? activeTextStyle : textStyle}
      >
        {title}
      </div>
      <IconButton
        iconProps={active ? activeCancelIcon : cancelIcon}
        styles={iconButtonStyles}
        onClick={handleClose}
      />
    </div>
  );
}
