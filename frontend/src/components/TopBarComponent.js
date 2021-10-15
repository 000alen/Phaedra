import React, { useState } from "react";
import { IconButton } from "@fluentui/react";

import { ipcRenderer, theme } from "../index";

import "../css/components/TopBarComponent.css";

export default function TopBarComponent({ children }) {
  const [showMaximize, setShowMaximize] = useState(true);

  const changeMaximizeRestoreButton = (isMaximizedApp) => {
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

  const minimizeIcon = {
    iconName: "ChromeMinimize",
    styles: {
      root: { color: theme.palette.black },
    },
  };

  const maximizeRestoreIcon = {
    iconName: showMaximize ? "ChromeFullScreen" : "ChromeRestore",
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

  ipcRenderer.on("isMaximized", () => {
    changeMaximizeRestoreButton(true);
  });

  ipcRenderer.on("isRestored", () => {
    changeMaximizeRestoreButton(false);
  });

  const topBarStyle = {
    backgroundColor: theme.palette.white,
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
          iconProps={maximizeRestoreIcon}
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
