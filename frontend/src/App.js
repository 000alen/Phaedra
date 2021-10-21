import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import StatusBarComponent from "./components/StatusBar/StatusBarComponent";
import TabsComponent from "./components/Tabs/TabsComponent";
import TopBarComponent from "./components/TopBarComponent";

import { getTabContent, createTab } from "./manipulation/TabsManipulation";

import { EmptyPage } from "./pages/EmptyPage";
import { MainPage } from "./pages/MainPage/MainPage";
import { AppController } from "./contexts/AppController";

import "./css/App.css";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.tabsDo = this.tabsDo.bind(this);
    this.clipboardDo = this.clipboardDo.bind(this);
    this.getStatusBarRef = this.getStatusBarRef.bind(this);

    this.statusBarRef = React.createRef();

    this.state = {
      tabs: [],
      activeTab: undefined,
      clipboard: [],
    };
  }

  /**
   * Does an action on the tabs
   * @param {Function} action
   * @param {Object} args
   */
  tabsDo(action, args) {
    if (args === undefined) args = {};

    let { tabs, activeTab } = this.state;

    switch (action.name) {
      case "addTab":
        const id = uuidv4();
        if (args.tab === undefined) {
          const tab = createTab({
            id: id,
            content: <EmptyPage key={id} id={id} />,
          });
          args = { ...args, tab: tab };
        }
        break;
      default:
        break;
    }

    let tabsInformation = action(tabs, activeTab, args);

    this.setState((state) => {
      return {
        ...state,
        ...tabsInformation,
      };
    });
  }

  /**
   * Does an action on the clipboard.
   * @param {Function} action
   * @param {Object} args
   */
  clipboardDo(action, args) {
    let clipboard = this.state.clipboard;

    let currentClipboard;
    switch (action.name) {
      default:
        currentClipboard = action(clipboard, args);
    }

    this.setState((state) => {
      return {
        ...state,
        clipboard: currentClipboard,
      };
    });
  }

  getStatusBarRef() {
    return this.statusBarRef;
  }

  render() {
    const { tabs, activeTab } = this.state;

    let content;
    if (activeTab === undefined) {
      content = <MainPage id={uuidv4()} />;
    } else {
      content = getTabContent(tabs, { id: activeTab });
    }

    return (
      <AppController.Provider
        value={{
          tabsDo: this.tabsDo,
          clipboardDo: this.clipboardDo,
          getStatusBarRef: this.getStatusBarRef,
        }}
      >
        <div className="app">
          <TopBarComponent>
            <TabsComponent
              tabs={tabs}
              activeTab={activeTab}
              onAction={this.tabsDo}
            />
          </TopBarComponent>

          <div className="appContent">{content}</div>

          <StatusBarComponent ref={this.statusBarRef} />
        </div>
      </AppController.Provider>
    );
  }
}
