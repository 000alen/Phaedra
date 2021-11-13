import React, { Component } from "react";

import {
  IconButton,
  IOverflowSetItemProps,
  Label,
  OverflowSet,
} from "@fluentui/react";

import { ITab } from "../App";
import { AppController, IAppController } from "../contexts/AppController";
import { theme } from "../resources/theme";

export interface TabsProps {
  tabs: ITab[];
  activeTabId: string | undefined;
}

const numberOfTabs = 5;

export interface TabProps {
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

export function Tab({ id, title, active, onAction }: TabProps) {
  const appController = React.useContext(AppController);

  const handleSelect = () => {
    appController.selectTab(id);
  };

  const handleClose = () => {
    appController.removeTab(id);
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

export class Tabs extends Component<TabsProps> {
  static contextType = AppController;

  constructor(props: TabsProps) {
    super(props);

    this.onRenderTab = this.onRenderTab.bind(this);
    this.onRenderTabOverflow = this.onRenderTabOverflow.bind(this);
    this.populateTabItem = this.populateTabItem.bind(this);
    this.populateTabOverflowItem = this.populateTabOverflowItem.bind(this);
  }

  onRenderTab(item: IOverflowSetItemProps) {
    return (
      <Tab
        key={item.id}
        id={item.id}
        title={item.name}
        active={item.active}
        onAction={item.onAction}
      />
    );
  }

  onRenderTabOverflow(overflowItems: IOverflowSetItemProps[] | undefined) {
    return (
      <IconButton
        menuIconProps={{ iconName: "More" }}
        menuProps={{ items: overflowItems! }}
      />
    );
  }

  populateTabItem(tab: ITab) {
    const { activeTabId } = this.props;

    return {
      key: tab.id,
      id: tab.id,
      name: tab.title,
      active: tab.id === activeTabId,
    };
  }

  populateTabOverflowItem(tab: ITab) {
    const appController: IAppController = this.context;
    const { activeTabId } = this.props;

    return {
      key: tab.id,
      id: tab.id,
      name: tab.title,
      active: tab.id === activeTabId,
      onClick: () => appController.selectTab(tab.id),
      onRender: () => {
        return (
          <div className="flex flex-row items-center ml-2">
            <Label>{tab.title}</Label>
            <IconButton
              iconProps={{ iconName: "Cancel" }}
              onClick={() => appController.removeTab(tab.id)}
            />
          </div>
        );
      },
    };
  }

  render() {
    const appController: IAppController = this.context;
    const { tabs } = this.props;

    const addIcon = {
      iconName: "Add",
      styles: {
        root: { color: theme.palette.neutralPrimary },
      },
    };

    const items = tabs.slice(0, numberOfTabs).map(this.populateTabItem);

    const overflowItems = tabs
      .slice(numberOfTabs)
      .map(this.populateTabOverflowItem);

    return (
      <div className="flex flex-row items-center">
        <OverflowSet
          items={items}
          overflowItems={overflowItems}
          onRenderItem={this.onRenderTab}
          onRenderOverflowButton={this.onRenderTabOverflow}
        />

        <IconButton
          className={`${iconButtonStyles}`}
          iconProps={addIcon}
          onClick={() => appController.addTab(appController.createEmptyTab()!)}
        />
      </div>
    );
  }
}
