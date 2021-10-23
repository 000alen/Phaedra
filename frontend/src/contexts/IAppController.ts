import StatusBarComponent from "../components/StatusBar/StatusBarComponent";
import {
  IClipboardCommand,
  IClipboardManipulation,
} from "../manipulation/IClipboardManipulation";
import {
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
}
