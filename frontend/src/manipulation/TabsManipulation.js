import { v4 as uuidv4 } from "uuid";

/**
 * @typedef {Object} Tab
 * @property {string} id
 * @property {string} title
 * @property {JSX.Element} [content]
 */

/**
 * @typedef {Object} TabsInformation
 * @property {Tab[]} tabs
 * @property {string} [activeTab]
 */

/**
 * Creates a tab.
 * @param {Object} args
 * @returns {Tab}
 */
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

/**
 * Inserts a Tab.
 * @param {Tab[]} tabs
 * @param {string} activeTab
 * @param {Object} args
 * @param {Tab} args.tab
 * @param {number} args.index
 * @returns {TabsInformation}
 */
export function insertTab(tabs, activeTab, { tab, index }) {
  let newTabs = [...tabs];
  newTabs.splice(index, 0, tab);
  return {
    tabs: newTabs,
    activeTab: tab.id,
  };
}

/**
 * Adds a Tab.
 * @param {Tab[]} tabs
 * @param {string} activeTab
 * @param {Object} args
 * @param {Tab} args.tab
 * @returns {TabsInformation}
 */
export function addTab(tabs, activeTab, { tab }) {
  return {
    tabs: [...tabs, tab],
    activeTab: tab.id,
  };
}

/**
 * Removes a Tab.
 * @param {Tab[]} tabs
 * @param {string} activeTab
 * @param {Object} args
 * @param {string} args.id
 * @returns {TabsInformation}
 */
export function removeTab(tabs, activeTab, { id }) {
  let activeTabIndex = tabs.findIndex((tab) => tab.id === id);

  let newTabs = tabs.filter((tab) => tab.id !== id);
  let newActiveTab = activeTab;
  if (newTabs.length && activeTabIndex !== 0) {
    newActiveTab = newTabs[activeTabIndex - 1].id;
  }

  return {
    tabs: newTabs,
    activeTab: newTabs.length ? newActiveTab : undefined,
  };
}

/**
 * Selects a Tab.
 * @param {Tab[]} tabs
 * @param {string} activeTab
 * @param {Object} args
 * @param {string} args.id
 * @returns {TabsInformation}
 */
export function selectTab(tabs, activeTab, { id }) {
  return {
    tabs: tabs,
    activeTab: id,
  };
}

/**
 * Sets a title of a Tab.
 * @param {Tab[]} tabs
 * @param {string} activeTab
 * @param {Object} args
 * @param {string} args.id
 * @param {string} args.title
 * @returns {TabsInformation}
 */
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

/**
 * Sets a title of a Tab.
 * @param {Tab[]} tabs
 * @param {string} activeTab
 * @param {Object} args
 * @param {string} args.id
 * @param {JSX.Element} args.content
 * @returns {TabsInformation}
 */
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

/**
 * Returns index of a Tab.
 * @param {Tab[]} tabs
 * @param {Object} args
 * @param {string} args.id
 * @returns {number}
 */
export function indexTab(tabs, { id }) {
  return tabs.findIndex((tab) => tab.id === id);
}

/**
 * Returns a Tab.
 * @param {Tab[]} tabs
 * @param {object} args
 * @param {string} args.id
 * @returns {Tab | undefined}
 */
export function getTab(tabs, { id }) {
  return tabs.find((tab) => tab.id === id);
}

/**
 * Returns title of a Tab.
 * @param {Tab[]} tabs
 * @param {Object} args
 * @param {string} args.id
 * @returns {string | undefined}
 */
export function getTabTitle(tabs, { id }) {
  let tab = tabs.find((tab) => tab.id === id);

  if (tab === undefined) return undefined;

  return tab.title;
}

/**
 * Returns title of a Tab.
 * @param {Tab[]} tabs
 * @param {Object} args
 * @param {string} args.id
 * @returns {JSX.Element | undefined}
 */
export function getTabContent(tabs, { id }) {
  let tab = tabs.find((tab) => tab.id === id);

  if (tab === undefined) return undefined;

  return tab.content;
}
