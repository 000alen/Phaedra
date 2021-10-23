import React from "react";
import { IClipboardCommand } from "../manipulation/ClipboardManipulation";
import { ITabsCommand } from "../manipulation/TabsManipulation";
import StatusBarComponent from "../components/StatusBar/StatusBarComponent";

export interface IAppController {
  tabsDo: (action: Function, args: ITabsCommand) => void;
  clipboardDo: (action: Function, args: IClipboardCommand) => void;
  getStatusBarRef: () => React.RefObject<StatusBarComponent> | undefined;
}

export const AppController = React.createContext<IAppController>({
  tabsDo: (action: Function, args: ITabsCommand) => {},
  clipboardDo: (action: Function, args: IClipboardCommand) => {},
  getStatusBarRef: () => undefined,
});
