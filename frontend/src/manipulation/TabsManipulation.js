import { v4 as uuidv4 } from "uuid";

export function createTab({ id, title, content }) {
  if (!id) id = uuidv4();
  if (!title) title = "New Tab";
  if (!content) content = null;

  return {
    id: id,
    title: title,
    content: content,
  };
}

export function insertTab(tabs, activeTab, { tab, index }) {
  let newTabs = [...tabs];
  newTabs.splice(index, 0, tab);
  return {
    tabs: newTabs,
    activeTab: tab.id,
  };
}

export function addTab(tabs, activeTab, { tab }) {
  return {
    tabs: [...tabs, tab],
    activeTab: tab.id,
  };
}

export function removeTab(tabs, activeTab, { id }) {
  let activeTabIndex = tabs.findIndex((tab) => tab.id === id);

  let newTabs = tabs.filter((tab) => tab.id !== id);
  let newActiveTab = activeTab;
  if (newTabs.length && activeTabIndex !== 0) {
    newActiveTab = newTabs[activeTabIndex - 1].id;
  } else if (!newTabs.length) {
    newActiveTab = null;
  }

  return {
    tabs: newTabs,
    activeTab: newActiveTab,
  };
}

export function selectTab(tabs, activeTab, { id }) {
  return {
    tabs: tabs,
    activeTab: id,
  };
}

export function setTabTitle(tabs, activeTab, { id, title }) {
  return {
    tabs: tabs.map((tab) => {
      return {
        ...tab,
        title: tab.id === id ? title : tab.title,
      };
    }),
    activeTab: activeTab,
  };
}

export function setTabContent(tabs, activeTab, { id, content }) {
  return {
    tabs: tabs.map((tab) => {
      return {
        ...tab,
        content: tab.id === id ? content : tab.content,
      };
    }),
    activeTab: activeTab,
  };
}

export function indexTab(tabs, { id }) {
  return tabs.findIndex((tab) => tab.id === id);
}

export function getTab(tabs, { id }) {
  return tabs.find((tab) => tab.id === id);
}

export function getTabTitle(tabs, { id }) {
  return tabs.find((tab) => tab.id === id).title;
}
export function getTabContent(tabs, { id }) {
  return tabs.find((tab) => tab.id === id).content;
}
