import React, { Component } from "react";

import { IconButton } from "@fluentui/react";

import { ITab } from "../App";
import { ipcRenderer } from "../index";
import { theme } from "../resources/theme";
import { Tabs } from "./Tabs";

export interface TopBarProps {
  tabs: ITab[];
  activeTabId: string | undefined;
}

export interface TopBarState {
  showMaximize: boolean;
}

export class TopBar extends Component<TopBarProps, TopBarState> {
  constructor(props: TopBarProps) {
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
    const { tabs, activeTabId } = this.props;

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
      <div
        className="w-[100%] h-10 flex flex-row z-50 select-none items-center"
        style={topBarStyle}
      >
        <div className="drag-region w-[90%] flex items-center">
          <div className="no-drag-region max-w-[90%] h-[100%] inline-flex flex-row items-center ml-1">
            <Tabs tabs={tabs} activeTabId={activeTabId} />
          </div>
        </div>

        <div className="w-[10%] flex flex-row justify-end h-4 mx-2 space-x-3">
          <IconButton
            className="w-4 h-4 border-none outline-none bg-no-repeat cursor-pointer"
            iconProps={minimizeIcon}
            onClick={this.handleMinimizeButtonClick}
          />
          <IconButton
            className="w-4 h-4 border-none outline-none bg-no-repeat cursor-pointer"
            iconProps={showMaximize ? maximizeIcon : restoreIcon}
            onClick={this.handleMaximizeRestoreButtonClick}
          />
          <IconButton
            className="w-4 h-4 border-none outline-none bg-no-repeat cursor-pointer"
            iconProps={closeIcon}
            onClick={this.handleCloseButtonClick}
          />
        </div>
      </div>
    );
  }
}
