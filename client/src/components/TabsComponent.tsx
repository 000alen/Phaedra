import React from "react";

import {
  IconButton,
  IOverflowSetItemProps,
  Label,
  OverflowSet,
} from "@fluentui/react";

import { theme } from "../resources/theme";
import {
  addTab,
  ITab,
  removeTab,
  selectTab,
} from "../structures/TabsStructure";
import { iconButtonStyles, TabComponent } from "./TabComponent";

export interface TabsComponentProps {
  tabs: ITab[];
  activeTabId: string | undefined;
  tabsDo: Function;
}

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
  activeTabId,
  tabsDo,
}: TabsComponentProps) {
  const handleAdd = () => {
    tabsDo(addTab);
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
      active: tab.id === activeTabId,
      onAction: tabsDo,
    };
  });

  const overflowItems = tabs.slice(numberOfTabs).map((tab) => {
    return {
      key: tab.id,
      id: tab.id,
      name: tab.title,
      active: tab.id === activeTabId,
      onAction: tabsDo,
      onClick: () => tabsDo(selectTab, { id: tab.id }),
      onRender: () => {
        return (
          <div className="flex flex-row items-center ml-2">
            <Label>{tab.title}</Label>
            <IconButton
              iconProps={{ iconName: "Cancel" }}
              onClick={() => tabsDo(removeTab, { id: tab.id })}
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
