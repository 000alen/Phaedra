import { v4 as uuidv4 } from "uuid";

import { IAppController } from "../contexts/AppController";
import { EmptyPage } from "../pages/EmptyPage";
import { strings } from "../resources/strings";
import { IShortcuts } from "./IShortcuts";

export const AppShortcuts: IShortcuts = {
  "ctrl+n": (appController: IAppController) => {
    const id = uuidv4();
    appController.addTab({
      id: id,
      title: strings.newTabTitle,
      content: <EmptyPage id={id} />,
    });
  },
  "ctrl+w": (appController: IAppController) => {
    const activeTabId = appController.getActiveTabId()!;
    appController.removeTab(activeTabId);
  },
  "ctrl+shift+t": (AppController: IAppController) => {
    AppController.showTasksPanel();
  },
};
