import React, { Component } from "react";
import TopBarComponent from "./components/TopBarComponent";
import TabsComponent from "./components/TabsComponent";
import EmptyPage from "./pages/EmptyPage";
import MainPage from "./pages/MainPage/MainPage";
import { v4 as uuidv4 } from "uuid";
import "./css/App.css";
import StatusBarComponent from "./components/StatusBarComponent";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.getNextTabId = this.getNextTabId.bind(this);
    this.selectTab = this.selectTab.bind(this);
    this.addTab = this.addTab.bind(this);
    this.closeTab = this.closeTab.bind(this);
    this.setTabTitle = this.setTabTitle.bind(this);
    this.setTabContent = this.setTabContent.bind(this);

    this.getClipboard = this.getClipboard.bind(this);
    this.setClipboard = this.setClipboard.bind(this);

    this.statusBarRef = React.createRef();

    const appController = {
      getNextTabId: this.getNextTabId,
      selectTab: this.selectTab,
      addTab: this.addTab,
      closeTab: this.closeTab,
      setTabTitle: this.setTabTitle,
      setTabContent: this.setTabContent,
      getClipboard: this.getClipboard,
      setClipboard: this.setClipboard,
    };

    this.state = {
      appController: appController,
      tabs: [],
      selectedTab: null,
      clipboard: null,
    };
  }

  /**
   *
   * @returns
   */
  getNextTabId() {
    return this.state.tabs.length + 1;
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  getTabIndex(id) {
    return this.state.tabs.findIndex((tab) => tab.id === id);
  }

  /**
   *
   * @param {*} index
   * @returns
   */
  getTabId(index) {
    return this.state.tabs[index].id;
  }

  /**
   *
   * @returns
   */
  createEmptyTab() {
    const id = uuidv4();

    return {
      id: id,
      title: `New Tab`,
      content: (
        <EmptyPage
          key={id}
          id={id}
          appController={this.state.appController}
          statusBarRef={this.statusBarRef}
        />
      ),
    };
  }

  /**
   *
   * @param {*} id
   */
  selectTab(id) {
    this.setState({ ...this.state, selectedTab: id });
  }

  /**
   *
   * @param {*} content
   */
  addTab(content) {
    let newTab;
    if (!content) {
      newTab = this.createEmptyTab();
    } else {
      const id = content.props.id;
      newTab = {
        id: id,
        title: `Tab ${id}`,
        content: content,
      };
    }

    let newSelectedTab;
    if (!this.state.tabs.length) {
      newSelectedTab = newTab.id;
    } else {
      newSelectedTab = this.state.selectedTab;
    }

    this.setState({
      ...this.state,
      tabs: [...this.state.tabs, newTab],
      selectedTab: newSelectedTab,
    });
  }

  /**
   *
   * @param {*} id
   */
  closeTab(id) {
    const newTabs = this.state.tabs.filter((tab) => tab.id !== id);

    let newSelectedTab;
    if (this.state.selectedTab === id) {
      const index = this.getTabIndex(id);

      if (newTabs.length === 0) {
        newSelectedTab = null;
      } else {
        newSelectedTab = newTabs[index === 0 ? 0 : index - 1].id;
      }
    } else {
      newSelectedTab = this.state.selectedTab;
    }

    if (!newTabs.length) newSelectedTab = null;

    this.setState({
      ...this.state,
      tabs: newTabs,
      selectedTab: newSelectedTab,
    });
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  getTabContent(id) {
    if (!id) return null;
    return this.state.tabs.find((tab) => tab.id === id).content;
  }

  /**
   *
   * @param {*} id
   * @param {*} newTitle
   */
  setTabTitle(id, newTitle) {
    const index = this.getTabIndex(id);
    let newTabs = [...this.state.tabs];
    newTabs[index].title = newTitle;
    this.setState({ ...this.state, tabs: newTabs });
  }

  /**
   *
   * @param {*} id
   * @param {*} newContent
   */
  setTabContent(id, newContent) {
    const index = this.getTabIndex(id);
    let newTabs = [...this.state.tabs];
    newTabs[index].content = newContent;
    this.setState({ ...this.state, tabs: newTabs });
  }

  /**
   *
   * @returns
   */
  getClipboard() {
    return this.state.clipboard;
  }

  /**
   *
   * @param {*} content
   */
  setClipboard(content) {
    this.setState((state) => {
      return {
        ...state,
        clipboard: content,
      };
    });
  }

  render() {
    const { tabs, selectedTab } = this.state;

    return (
      <div className="app">
        <TopBarComponent>
          <TabsComponent
            tabs={tabs}
            selectedTab={selectedTab}
            onAdd={this.addTab}
            onSelect={this.selectTab}
            onClose={this.closeTab}
          />
        </TopBarComponent>

        <div className="appContent">
          {selectedTab ? (
            this.getTabContent(selectedTab)
          ) : (
            <MainPage
              appController={this.state.appController}
              statusBarRef={this.statusBarRef}
            />
          )}
        </div>

        <StatusBarComponent ref={this.statusBarRef} />
      </div>
    );
  }
}
