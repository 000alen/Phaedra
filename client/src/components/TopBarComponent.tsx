import "../css/TopBarComponent.css";

import React, { Component } from "react";

import { IconButton } from "@fluentui/react";

import { ipcRenderer } from "../index";
import { theme } from "../resources/theme";
import {
  ITab,
  ITabsManipulation,
  ITabsManipulationArguments,
} from "../structures/TabsStructure";
import TabsComponent from "./TabsComponent";

export interface TopBarComponentProps {
  tabs: ITab[];
  activeTabId: string | undefined;
  tabsDo: (
    manipulation: ITabsManipulation,
    args: ITabsManipulationArguments
  ) => void;
}

export interface TopBarComponentState {
  showMaximize: boolean;
}

export default class TopBarComponent extends Component<
  TopBarComponentProps,
  TopBarComponentState
> {
  constructor(props: TopBarComponentProps) {
    super(props);

    this.setMaximizeRestoreButton = this.setMaximizeRestoreButton.bind(this);
    this.handleMinimizeButtonClick = this.handleMinimizeButtonClick.bind(this);
    this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
    this.handleMaximizeRestoreButtonClick =
      this.handleMaximizeRestoreButtonClick.bind(this);

    this.state = {
      showMaximize: true,
    };
  }

  componentDidMount() {
    ipcRenderer.on("isMaximized", () => {
      this.setMaximizeRestoreButton(true);
    });

    ipcRenderer.on("isRestored", () => {
      this.setMaximizeRestoreButton(false);
    });
  }

  handleCloseButtonClick() {
    ipcRenderer.send("closeApp");
  }

  setMaximizeRestoreButton(isMaximizedApp: boolean) {
    this.setState((state) => {
      return {
        ...state,
        showMaximize: !isMaximizedApp,
      };
    });
  }

  handleMinimizeButtonClick() {
    ipcRenderer.send("minimizeApp");
  }

  handleMaximizeRestoreButtonClick() {
    ipcRenderer.send("maximizeRestoreApp");
  }

  render() {
    const { showMaximize } = this.state;
    const { tabs, activeTabId, tabsDo } = this.props;

    const topBarStyle = {
      backgroundColor: theme.palette.white,
    };

    const minimizeIcon = {
      iconName: "ChromeMinimize",
      styles: {
        root: { color: theme.palette.black },
      },
    };
    const maximizeIcon = {
      iconName: "ChromeFullScreen",
      styles: {
        root: { color: theme.palette.black },
      },
    };

    const restoreIcon = {
      iconName: "ChromeRestore",
      styles: {
        root: { color: theme.palette.black },
      },
    };

    const closeIcon = {
      iconName: "ChromeClose",
      styles: {
        root: { color: theme.palette.black },
      },
    };

    return (
      <div className="topBar flex items-center" style={topBarStyle}>
        <div className="titleBar">
          <div className="titleBarChildren">
            <TabsComponent
              tabs={tabs}
              activeTabId={activeTabId}
              tabsDo={tabsDo}
            />
          </div>
        </div>

        <div className="titleBarButtons mx-2 space-x-2">
          <IconButton
            className="topButton"
            iconProps={minimizeIcon}
            onClick={this.handleMinimizeButtonClick}
          />
          <IconButton
            className="topButton"
            iconProps={showMaximize ? maximizeIcon : restoreIcon}
            onClick={this.handleMaximizeRestoreButtonClick}
          />
          <IconButton
            className="topButton"
            iconProps={closeIcon}
            onClick={this.handleCloseButtonClick}
          />
        </div>
      </div>
    );
  }
}
