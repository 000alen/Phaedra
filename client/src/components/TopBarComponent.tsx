import "../css/components/TopBarComponent.css";

import React, { useState } from "react";

import { IconButton } from "@fluentui/react";

import { ipcRenderer, theme } from "../index";
import { TopBarComponentProps } from "./ITopBarComponent";

export default function TopBarComponent({
  children,
}: TopBarComponentProps): JSX.Element {
  const [showMaximize, setShowMaximize] = useState(true);

  const changeMaximizeRestoreButton = (isMaximizedApp: boolean) => {
    if (isMaximizedApp) {
      setShowMaximize(false);
    } else {
      setShowMaximize(true);
    }
  };

  const handleMinimizeButtonClick = () => {
    ipcRenderer.send("minimizeApp");
  };

  const handleMaximizeRestoreButtonClick = () => {
    ipcRenderer.send("maximizeRestoreApp");
  };

  const handleCloseButtonClick = () => {
    ipcRenderer.send("closeApp");
  };

  ipcRenderer.on("isMaximized", () => {
    changeMaximizeRestoreButton(true);
  });

  ipcRenderer.on("isRestored", () => {
    changeMaximizeRestoreButton(false);
  });

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
    <div className="topBar" style={topBarStyle}>
      <div className="titleBar">
        <div className="titleBarChildren">{children}</div>
      </div>

      <div className="titleBarButtons">
        <IconButton
          className="topButton"
          iconProps={minimizeIcon}
          onClick={handleMinimizeButtonClick}
        />
        <IconButton
          className="topButton"
          iconProps={showMaximize ? maximizeIcon : restoreIcon}
          onClick={handleMaximizeRestoreButtonClick}
        />
        <IconButton
          className="topButton"
          iconProps={closeIcon}
          onClick={handleCloseButtonClick}
        />
      </div>
    </div>
  );
}