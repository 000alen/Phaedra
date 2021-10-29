import {
  IClipboard,
  IClipboardCommand,
  IClipboardManipulation,
} from "../structures/clipboard/IClipboardManipulation";
import {
  ITab,
  ITabsCommand,
  ITabsManipulation,
} from "../structures/tabs/ITabsManipulation";
import {
  ITask,
  ITasksCommand,
  ITasksManipulation,
} from "../structures/tasks/ITasksManipulation";
import {
  IWidget,
  IWidgetsCommand,
  IWidgetsManipulation,
} from "../structures/widgets/IWidgetsManipulation";

export interface IAppController {
  tabsDo: (action: ITabsManipulation, args: ITabsCommand) => void;
  clipboardDo: (
    action: IClipboardManipulation,
    args: IClipboardCommand
  ) => void;
  tasksDo: (action: ITasksManipulation, args: ITasksCommand) => void;
  widgetsDo: (action: IWidgetsManipulation, args: IWidgetsCommand) => void;
  getTabs: () => ITab[] | undefined;
  getActiveTab: () => string | undefined;
  getClipboard: () => IClipboard | undefined;
  getTasks: () => ITask[] | undefined;
  getWidgets: () => IWidget[] | undefined;
}
