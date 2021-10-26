import React from "react";

import {
  IconButton,
  IOverflowSetItemProps,
  Label,
  OverflowSet,
} from "@fluentui/react";

import { theme } from "../../index";
import {
  addTab,
  removeTab,
  selectTab,
} from "../../manipulation/TabsManipulation";
import { TabsComponentProps } from "./ITabsComponent";
import { iconButtonStyles, TabComponent } from "./TabComponent";

const numberOfTabs = 5;

const onRenderItem = (item: IOverflowSetItemProps) => {
  return (
    <TabComponent
      key={item.id}
      id={item.id}
      title={item.name}
      active={item.active}
      onAction={item.onAction}
    />
  );
};

const onRenderOverflowButton = (
  overflowItems: IOverflowSetItemProps[] | undefined
) => {
  return (
    <IconButton
      menuIconProps={{ iconName: "More" }}
      menuProps={{ items: overflowItems! }}
    />
  );
};

export default function TabsComponent({
  tabs,
  activeTab,
  onAction,
}: TabsComponentProps) {
  const handleAdd = () => {
    onAction(addTab);
  };

  const addIcon = {
    iconName: "Add",
    styles: {
      root: { color: theme.palette.neutralPrimary },
    },
  };

  const items = tabs.slice(0, numberOfTabs).map((tab) => {
    return {
      key: tab.id,
      id: tab.id,
      name: tab.title,
      active: tab.id === activeTab,
      onAction: onAction,
    };
  });

  const overflowItems = tabs.slice(numberOfTabs).map((tab) => {
    return {
      key: tab.id,
      id: tab.id,
      name: tab.title,
      active: tab.id === activeTab,
      onAction: onAction,
      onClick: () => onAction(selectTab, { id: tab.id }),
      onRender: () => {
        return (
          <div className="flex flex-row items-center ml-2">
            <Label>{tab.title}</Label>
            <IconButton
              iconProps={{ iconName: "Cancel" }}
              onClick={() => onAction(removeTab, { id: tab.id })}
            />
          </div>
        );
      },
    };
  });

  return (
    <div className="flex flex-row items-center ml-2 mt-2">
      <OverflowSet
        items={items}
        overflowItems={overflowItems}
        onRenderItem={onRenderItem}
        onRenderOverflowButton={onRenderOverflowButton}
      />

      <IconButton
        className={`${iconButtonStyles}`}
        iconProps={addIcon}
        onClick={handleAdd}
      />
    </div>
  );
}
