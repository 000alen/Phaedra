import React from "react";

import {
  IconButton,
  IContextualMenuItem,
  IOverflowSetItemProps,
  Label,
  OverflowSet,
  ResizeGroup
} from "@fluentui/react";

import { AppController, IAppController } from "../contexts";
import { getTheme } from "../themes";
import { ITab } from "../types";

export interface IOverflowData {
  primary: IContextualMenuItem[];
  overflow: IContextualMenuItem[];
  cacheKey?: string;
}

export interface TabsProps {
  tabs: ITab[];
  activeTabId: string | undefined;
}

export interface TabProps {
  id: string;
  title: string;
  active: boolean;
  dirty: boolean;
}

export const iconButtonStyles = {
  rootHovered: {
    backgroundColor: "transparent"
  },
  rootPressed: {
    backgroundColor: "transparent"
  }
};

export function Tab({ id, title, dirty, active }: TabProps) {
  const appController = React.useContext(AppController);

  const handleSelect = () => {
    appController.selectTab(id);
  };

  const handleClose = () => {
    appController.removeTab(id);
  };

  const theme = getTheme();

  const tabStyle = { backgroundColor: theme.palette.neutralPrimary };
  const textStyle = { color: theme.palette.white };
  const cancelIcon = {
    iconName: "Cancel",
    styles: {
      root: { color: theme.palette.white }
    }
  };

  const activeTabStyle = { backgroundColor: theme.palette.themePrimary };
  const activeTextStyle = { color: theme.palette.white };
  const activeCancelIcon = {
    iconName: "Cancel",
    styles: {
      root: { color: theme.palette.white }
    }
  };

  return (
    <div
      className="no-drag-region pl-2 mr-1 rounded-sm flex items-center"
      style={active ? activeTabStyle : tabStyle}
    >
      <div
        className={`font-medium`}
        onClick={handleSelect}
        style={active ? activeTextStyle : textStyle}
      >
        {`${dirty ? "*" : ""}${title}`}
      </div>
      <IconButton
        iconProps={active ? activeCancelIcon : cancelIcon}
        styles={iconButtonStyles}
        onClick={handleClose}
      />
    </div>
  );
}

export function OverflowTab({ id, title, dirty, active }: TabProps) {
  const appController: IAppController = React.useContext(AppController);
  return (
    <div className="flex flex-row items-center ml-2">
      <Label>{`${dirty ? "*" : ""}${title}`}</Label>
      <IconButton
        iconProps={{ iconName: "Cancel" }}
        onClick={() => appController.removeTab(id)}
      />
    </div>
  );
}

export class Tabs extends React.Component<TabsProps> {
  static contextType = AppController;

  constructor(props: TabsProps) {
    super(props);

    this.computeCacheKey = this.computeCacheKey.bind(this);
    this.onReduceData = this.onReduceData.bind(this);
    this.onGrowData = this.onGrowData.bind(this);
    this.onRenderItem = this.onRenderItem.bind(this);
    this.onRenderOverflowButton = this.onRenderOverflowButton.bind(this);
    this.onRenderData = this.onRenderData.bind(this);

    this.populateItem = this.populateItem.bind(this);
    this.generateData = this.generateData.bind(this);
  }

  computeCacheKey(primaryControls: IContextualMenuItem[]): string {
    return primaryControls.reduce((acc, current) => acc + current.key, "");
  }

  onReduceData(currentData: any) {
    if (currentData.primary.length === 0) {
      return undefined;
    }
    const overflow = [
      ...currentData.primary.slice(-1),
      ...currentData.overflow
    ];
    const primary = currentData.primary.slice(0, -1);
    const cacheKey = this.computeCacheKey(primary);
    return { primary, overflow, cacheKey };
  }

  onGrowData(currentData: any) {
    if (currentData.overflow.length === 0) {
      return undefined;
    }
    const overflow = currentData.overflow.slice(1);
    const primary = [
      ...currentData.primary,
      ...currentData.overflow.slice(0, 1)
    ];
    const cacheKey = this.computeCacheKey(primary);
    return { primary, overflow, cacheKey };
  }

  onRenderItem(item: IOverflowSetItemProps) {
    return (
      <Tab
        key={item.id}
        id={item.id}
        title={item.name}
        dirty={item.dirty}
        active={item.active}
      />
    );
  }

  onRenderOverflowButton(overflowItems: IOverflowSetItemProps[] | undefined) {
    return (
      <IconButton
        className="no-drag-region"
        menuIconProps={{ iconName: "More" }}
        menuProps={{ items: overflowItems! }}
      />
    );
  }

  onRenderData(data: any) {
    return (
      <OverflowSet
        className="h-full"
        role="menubar"
        items={data.primary}
        overflowItems={data.overflow.length ? data.overflow : null}
        onRenderItem={this.onRenderItem}
        onRenderOverflowButton={this.onRenderOverflowButton}
      />
    );
  }

  populateItem(tab: ITab) {
    const appController: IAppController = this.context;
    const { activeTabId } = this.props;

    return {
      key: tab.id,
      id: tab.id,
      name: tab.title,
      dirty: tab.dirty,
      active: tab.id === activeTabId,
      onClick: () => appController.selectTab(tab.id),
      onRender: () => (
        <OverflowTab
          key={tab.id}
          id={tab.id}
          title={tab.title}
          dirty={tab.dirty}
          active={tab.id === activeTabId}
        />
      )
    };
  }

  generateData(items: any[]): IOverflowData {
    let cacheKey = "";
    for (let index = 0; index < items.length; index++)
      cacheKey = cacheKey + items[index].key;
    return {
      primary: items,
      overflow: [] as any[],
      cacheKey: cacheKey
    };
  }

  render() {
    const { tabs } = this.props;

    const items = tabs.map(this.populateItem);
    const data = this.generateData(items);

    return (
      <div className="w-full h-full items-center">
        <ResizeGroup
          data={data}
          onReduceData={this.onReduceData}
          onGrowData={this.onGrowData}
          onRenderData={this.onRenderData}
        />
      </div>
    );
  }
}
