import React from "react";
import { IconButton } from "@fluentui/react";

import { TabComponent, iconButtonStyles } from "./TabComponent";

import { addTab } from "../../manipulation/TabsManipulation";

import { theme } from "../../index";

export default function TabsComponent({ tabs, activeTab, onAction }) {
  const handleAdd = () => {
    onAction(addTab);
  };

  const addIcon = {
    iconName: "Add",
    styles: {
      root: { color: theme.palette.neutralPrimary },
    },
  };

  return (
    <div className="flex flex-row items-center ml-2 mt-2 space-x-2">
      {tabs.map((tab) => (
        <TabComponent
          key={tab.id}
          id={tab.id}
          title={tab.title}
          active={tab.id === activeTab}
          onAction={onAction}
        />
      ))}
      <IconButton
        iconProps={addIcon}
        styles={iconButtonStyles}
        onClick={handleAdd}
      />
    </div>
  );
}
