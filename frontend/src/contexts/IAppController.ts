import StatusBarComponent from "../components/StatusBar/StatusBarComponent";
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

export interface IAppController {
  tabsDo: (action: ITabsManipulation, args: ITabsCommand) => void;
  clipboardDo: (
    action: IClipboardManipulation,
    args: IClipboardCommand
  ) => void;
  getStatusBarRef: () => React.RefObject<StatusBarComponent> | undefined;
  getTabs: () => ITab[] | undefined;
  getClipboard: () => IClipboard | undefined;
}
