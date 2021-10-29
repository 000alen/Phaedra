import { ITab } from "./ITabsManipulation";

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
