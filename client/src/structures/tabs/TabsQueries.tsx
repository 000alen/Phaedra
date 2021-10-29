import { ITab, ITabsCommand } from "./ITabsManipulation";

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
