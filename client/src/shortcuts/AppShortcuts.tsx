import { v4 } from "uuid";

import { IAppController } from "../contexts/IAppController";
import { EmptyPage } from "../pages/EmptyPage";
import { createTab } from "../structures/tabs/TabsConstructors";
import { addTab, removeTab } from "../structures/tabs/TabsManipulation";
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
