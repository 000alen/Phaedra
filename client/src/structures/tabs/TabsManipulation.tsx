import { ITab, ITabsCommand, ITabsInformation } from "./ITabsManipulation";

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
