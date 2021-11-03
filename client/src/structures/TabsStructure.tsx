import { v4 as uuidv4 } from "uuid";

import { strings } from "../resources/strings";

export interface ITab {
  id: string;
  title: string;
  content?: JSX.Element;
}

export interface ITabsInformation {
  tabs: ITab[];
  activeTab?: string;
}

export interface ITabsManipulationArguments {
  tab?: ITab;
  id?: string;
  index?: number;
  title?: string;
  content?: JSX.Element;
}

export type ITabsManipulation = (
  tabs: ITab[],
  activeTab: string,
  tabsManipulationArguments: ITabsManipulationArguments
) => ITabsInformation;

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
  { tab, index }: ITabsManipulationArguments
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
  { tab }: ITabsManipulationArguments
): ITabsInformation {
  return {
    tabs: [...tabs!, tab!],
    activeTab: tab!.id,
  };
}

export function removeTab(
  tabs: ITab[],
  activeTab: string,
  { id }: ITabsManipulationArguments
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
  { id }: ITabsManipulationArguments
): ITabsInformation {
  return {
    tabs: tabs,
    activeTab: id,
  };
}

export function setTabTitle(
  tabs: ITab[],
  activeTab: string,
  { id, title }: ITabsManipulationArguments
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
  { id, content }: ITabsManipulationArguments
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

export function indexTab(tabs: ITab[], id: string): number {
  return tabs.findIndex((tab) => tab.id === id);
}

export function getTab(tabs: ITab[], id: string): ITab | undefined {
  return tabs.find((tab) => tab.id === id);
}

export function getTabTitle(tabs: ITab[], id: string): string {
  let tab = tabs.find((tab) => tab.id === id);

  return tab!.title;
}

export function getTabContent(
  tabs: ITab[],
  id: string
): JSX.Element | undefined {
  let tab = tabs.find((tab) => tab.id === id);

  return tab!.content;
}
