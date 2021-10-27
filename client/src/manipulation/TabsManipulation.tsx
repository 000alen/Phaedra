import { v4 as uuidv4 } from "uuid";

import { strings } from "../strings";
import { ITab, ITabsCommand, ITabsInformation } from "./ITabsManipulation";

export function createTab({ id, title, content }: Partial<ITab>): ITab {
  if (id === undefined) id = uuidv4();
  if (title === undefined) title = strings.newTabTitle;
  if (content === undefined) content = undefined;

  return {
    id: id,
    title: title,
    content: content,
  };
}

export function insertTab(
  tabs: ITab[],
  activeTab: string,
  { tab, index }: ITabsCommand
): ITabsInformation {
  let newTabs = [...tabs];
  newTabs.splice(index!, 0, tab!);
  return {
    tabs: newTabs,
    activeTab: tab!.id,
  };
}

export function addTab(
  tabs: ITab[],
  activeTab: string,
  { tab }: ITabsCommand
): ITabsInformation {
  return {
    tabs: [...tabs!, tab!],
    activeTab: tab!.id,
  };
}

export function removeTab(
  tabs: ITab[],
  activeTab: string,
  { id }: ITabsCommand
): ITabsInformation {
  let activeTabIndex = tabs.findIndex((tab) => tab.id === id);

  let newTabs = tabs.filter((tab) => tab.id !== id);
  let newActiveTab = activeTab;
  if (newTabs.length && activeTabIndex !== 0) {
    newActiveTab = newTabs[activeTabIndex - 1].id;
  }

  return {
    tabs: newTabs,
    activeTab: newTabs.length ? newActiveTab : undefined,
  };
}

export function selectTab(
  tabs: ITab[],
  activeTab: string,
  { id }: ITabsCommand
): ITabsInformation {
  return {
    tabs: tabs,
    activeTab: id,
  };
}

export function setTabTitle(
  tabs: ITab[],
  activeTab: string,
  { id, title }: ITabsCommand
): ITabsInformation {
  return {
    tabs: tabs.map((tab) => {
      return {
        ...tab,
        title: tab.id === id ? title! : tab.title,
      };
    }),
    activeTab: activeTab,
  };
}

export function setTabContent(
  tabs: ITab[],
  activeTab: string,
  { id, content }: ITabsCommand
): ITabsInformation {
  return {
    tabs: tabs.map((tab) => {
      return {
        ...tab,
        content: tab.id === id ? content : tab.content,
      };
    }),
    activeTab: activeTab,
  };
}

export function indexTab(tabs: ITab[], { id }: ITabsCommand): number {
  return tabs.findIndex((tab) => tab.id === id);
}

export function getTab(tabs: ITab[], { id }: ITabsCommand): ITab | undefined {
  return tabs.find((tab) => tab.id === id);
}

export function getTabTitle(tabs: ITab[], { id }: ITabsCommand): string {
  let tab = tabs.find((tab) => tab.id === id);

  return tab!.title;
}

export function getTabContent(
  tabs: ITab[],
  { id }: ITabsCommand
): JSX.Element | undefined {
  let tab = tabs.find((tab) => tab.id === id);

  return tab!.content;
}
