import { ITab } from "../../manipulation/ITabsManipulation";

export interface TabsComponentProps {
  tabs: ITab[];
  activeTab: string | undefined;
  onAction: Function;
}
