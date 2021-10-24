import {
  IClipboard,
  IClipboardCommand,
  IClipboardManipulation,
} from "../manipulation/IClipboardManipulation";
import {
  ITab,
  ITabsCommand,
  ITabsManipulation,
} from "../manipulation/ITabsManipulation";
import {
  ITask,
  ITasksCommand,
  ITasksManipulation,
} from "../manipulation/ITasksManipulation";
import {
  IWidget,
  IWidgetsCommand,
  IWidgetsManipulation,
} from "../manipulation/IWidgetsManipulation";

export interface IAppController {
  tabsDo: (action: ITabsManipulation, args: ITabsCommand) => void;
  clipboardDo: (
    action: IClipboardManipulation,
    args: IClipboardCommand
  ) => void;
  tasksDo: (action: ITasksManipulation, args: ITasksCommand) => void;
  widgetsDo: (action: IWidgetsManipulation, args: IWidgetsCommand) => void;
  getTabs: () => ITab[] | undefined;
  getClipboard: () => IClipboard | undefined;
  getTasks: () => ITask[] | undefined;
  getWidgets: () => IWidget[] | undefined;
}
