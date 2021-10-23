import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import StatusBarComponent from "./components/StatusBar/StatusBarComponent";
import TabsComponent from "./components/Tabs/TabsComponent";
import TopBarComponent from "./components/TopBarComponent";

import {
  getTabContent,
  createTab,
  ITab,
  ITabsCommand,
} from "./manipulation/TabsManipulation";

import { EmptyPage } from "./pages/EmptyPage";
import { MainPage } from "./pages/MainPage/MainPage";
import { AppController } from "./contexts/AppController";
import { AppShortcuts } from "./shortcuts/AppShortcuts";
import Mousetrap from "mousetrap";
import {
  IClipboard,
  IClipboardCommand,
} from "./manipulation/ClipboardManipulation";

import "./css/App.css";

interface AppProps {}

interface AppState {
  tabs: ITab[];
  activeTab: string | undefined;
  clipboard: IClipboard;
}

export default class App extends Component<AppProps, AppState> {
  statusBarRef: React.RefObject<StatusBarComponent>;

  constructor(props: AppProps) {
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

  componentDidMount(): void {
    for (const [keys, action] of Object.entries(AppShortcuts)) {
      Mousetrap.bind(keys, action, "keyup");
    }
  }

  componentWillUnmount(): void {
    for (const keys of Object.keys(AppShortcuts)) {
      Mousetrap.unbind(keys);
    }
  }

  tabsDo(action: Function, args: ITabsCommand): void {
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

  clipboardDo(action: Function, args: IClipboardCommand): void {
    const clipboard = this.state.clipboard;
    const currentClipboard = action(clipboard, args);

    this.setState((state) => {
      return {
        ...state,
        clipboard: currentClipboard,
      };
    });
  }

  getStatusBarRef(): React.RefObject<StatusBarComponent> {
    return this.statusBarRef;
  }

  render(): JSX.Element {
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
