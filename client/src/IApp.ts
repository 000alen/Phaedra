import { IAppController } from "./contexts/IAppController";
import { IClipboard } from "./manipulation/IClipboardManipulation";
import { ITab } from "./manipulation/ITabsManipulation";
import { ITask } from "./manipulation/ITasksManipulation";
import { IWidget } from "./manipulation/IWidgetsManipulation";

export interface AppProps {}

export interface AppState {
  tabs: ITab[];
  activeTab: string | undefined;
  tasks: ITask[];
  widgets: IWidget[];
  clipboard: IClipboard;
  appController: IAppController;
}
