import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import StatusBarComponent from "./components/StatusBarComponent";
import TabsComponent from "./components/Tabs/TabsComponent";
import TopBarComponent from "./components/TopBarComponent";

import { getTabContent, createTab } from "./manipulation/TabsManipulation";

import EmptyPage from "./pages/EmptyPage";
import MainPage from "./pages/MainPage/MainPage";

import "./css/App.css";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.tabsDo = this.tabsDo.bind(this);
    this.clipboardDo = this.clipboardDo.bind(this);

    this.statusBarRef = React.createRef();

    const appController = {
      tabsDo: this.tabsDo,
      clipboardDo: this.clipboardDo,
    };

    this.state = {
      appController: appController,
      tabs: [],
      activeTab: null,
      clipboard: null,
    };
  }

  tabsDo(action, args) {
    let { tabs, activeTab } = this.state;

    switch (action.name) {
      case "addTab":
        const id = uuidv4();
        const tab = createTab({
          id: id,
          content: (
            <EmptyPage
              key={id}
              id={id}
              appController={this.state.appController}
              statusBarRef={this.statusBarRef}
            />
          ),
        });
        args = { ...args, tab: tab };
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

  render() {
    const { tabs, activeTab } = this.state;

    let content;
    if (activeTab) {
      console.log(activeTab);
      content = getTabContent(tabs, { id: activeTab });
    } else {
      content = (
        <MainPage
          appController={this.state.appController}
          statusBarRef={this.statusBarRef}
        />
      );
    }

    return (
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
    );
  }
}
