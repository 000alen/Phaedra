import React from "react";

import {
  IClipboardCommand,
  IClipboardManipulation,
} from "../manipulation/IClipboardManipulation";
import {
  ITabsCommand,
  ITabsManipulation,
} from "../manipulation/ITabsManipulation";
import { IAppController } from "./IAppController";

export const AppController = React.createContext<IAppController>({
  tabsDo: (action: ITabsManipulation, args: ITabsCommand) => {},
  clipboardDo: (action: IClipboardManipulation, args: IClipboardCommand) => {},
  getStatusBarRef: () => undefined,
  getTabs: () => undefined,
  getClipboard: () => undefined,
});
