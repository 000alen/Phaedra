import { IAppController } from "../contexts/AppController";
import { IShortcuts } from "./IShortcuts";

export const AppShortcuts: IShortcuts = {
  "ctrl+n": (appController: IAppController) => {
    appController.tabsManager.add(appController.tabsManager.empty());
  },
  "ctrl+w": (appController: IAppController) => {
    console.log(appController.activeTabId);
    appController.tabsManager.remove(appController.tabsManager.activeId());
  },
  "ctrl+shift+t": (appController: IAppController) => {
    appController.showTasksPanel();
  },
};
