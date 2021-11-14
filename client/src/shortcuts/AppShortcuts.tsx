import { IAppController } from "../contexts/AppController";
import { IShortcuts } from "./IShortcuts";

export const AppShortcuts: IShortcuts = {
  "ctrl+n": (appController: IAppController) => {
    appController.addTab(appController.createEmptyTab()!);
  },
  "ctrl+w": (appController: IAppController) => {
    const activeTabId = appController.getActiveTabId()!;
    appController.closeTab(activeTabId);
  },
  "ctrl+shift+t": (AppController: IAppController) => {
    AppController.showTasksPanel();
  },
};
