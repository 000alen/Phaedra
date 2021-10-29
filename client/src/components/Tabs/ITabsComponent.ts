import { ITab } from "../../structures/tabs/ITabsManipulation";

export interface TabsComponentProps {
  tabs: ITab[];
  activeTab: string | undefined;
  onAction: Function;
}
