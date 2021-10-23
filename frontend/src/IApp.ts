import { IAppController } from "./contexts/IAppController";
import { IClipboard } from "./manipulation/IClipboardManipulation";
import { ITab } from "./manipulation/ITabsManipulation";

export interface AppProps {}

export interface AppState {
  tabs: ITab[];
  activeTab: string | undefined;
  clipboard: IClipboard;
  appController: IAppController;
}
