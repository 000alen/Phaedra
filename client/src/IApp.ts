import { IAppController } from "./contexts/IAppController";
import { IClipboard } from "./structures/clipboard/IClipboardManipulation";
import { ITab } from "./structures/tabs/ITabsManipulation";
import { ITask } from "./structures/tasks/ITasksManipulation";
import { IWidget } from "./structures/widgets/IWidgetsManipulation";

export interface AppProps {}

export interface AppState {
  tabs: ITab[];
  activeTab: string | undefined;
  tasks: ITask[];
  widgets: IWidget[];
  clipboard: IClipboard;
  appController: IAppController;
}
