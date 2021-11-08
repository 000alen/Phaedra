import { v4 } from "uuid";

import { AppController, IAppController } from "../contexts/AppController";
import { EmptyPage } from "../pages/EmptyPage";
import { addTab, createTab, removeTab } from "../structures/TabsStructure";
import { IShortcuts } from "./IShortcuts";

export const AppShortcuts: IShortcuts = {
  "ctrl+n": (appController: IAppController) => {
    const id = v4();
    appController.tabsDo(addTab, {
      tab: createTab({
        id: id,
        content: <EmptyPage id={id} />,
      }),
    });
  },
  "ctrl+w": (appController: IAppController) => {
    const activeTabId = appController.getActiveTabId();
    appController.tabsDo(removeTab, {
      id: activeTabId,
    });
  },
  "ctrl+shift+t": (AppController: IAppController) => {
    AppController.showTasksPanel();
  },
};
