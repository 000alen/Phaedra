import { useState } from "react";

import { ITab } from "../App";

export function useTabs(initialTabs: ITab[], initialActiveId: string) {
  const [tabs, setTabs] = useState(initialTabs);
  const [activeId, setActiveId] = useState(initialActiveId);

  return {
    tabs,
    activeId,
    tabsManager: new TabsManager(tabs, activeId, setTabs, setActiveId),
  };
}

export class TabsManager {
  tabs: ITab[];
  activeId: string;
  setTabs: (tabs: ITab[]) => void;
  setActiveId: (id: string) => void;

  constructor(
    tabs: ITab[],
    activeId: string,
    setTabs: (tabs: ITab[]) => void,
    setActiveId: (id: string) => void
  ) {
    this.tabs = tabs;
    this.activeId = activeId;
    this.setTabs = setTabs;
    this.setActiveId = setActiveId;
  }

  get(id: string) {}

  add(tab: ITab) {}

  close() {}

  select() {}

  setTitle() {}

  setContent() {}

  setDirty() {}
}
