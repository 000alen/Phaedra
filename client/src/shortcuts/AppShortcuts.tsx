import { v4 } from "uuid";

import { IAppController } from "../contexts/AppController";
import { EmptyPage } from "../pages/EmptyPage";
import { addTab, createTab, removeTab } from "../structures/TabsStructure";
import { IShortcuts } from "./IShortcuts";

export const AppShortcuts: IShortcuts = {
  "ctrl+t": (appController: IAppController) => {
    const id = v4();
    appController.tabsDo(addTab, {
      tab: createTab({
        id: id,
        content: <EmptyPage id={id} />,
      }),
    });
  },
  "ctrl+w": (appController: IAppController) => {
    const activeTab = appController.getActiveTab();
    appController.tabsDo(removeTab, {
      id: activeTab,
    });
  },
};
