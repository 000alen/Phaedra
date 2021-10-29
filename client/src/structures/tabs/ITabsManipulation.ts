export interface ITab {
  id: string;
  title: string;
  content?: JSX.Element;
}

export interface ITabsInformation {
  tabs: ITab[];
  activeTab?: string;
}

export interface ITabsCommand {
  tab?: ITab;
  id?: string;
  index?: number;
  title?: string;
  content?: JSX.Element;
}

export type ITabsManipulation = (
  tabs: ITab[],
  activeTab: string,
  tabsCommand: ITabsCommand
) => ITabsInformation;
