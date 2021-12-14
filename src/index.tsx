import "./css/index.css";

import React from "react";
import ReactDOM from "react-dom";

import { initializeIcons, ThemeProvider } from "@fluentui/react";

import { App } from "./App";
import { getTheme } from "./themes";
import Mousetrap from "mousetrap";

export const { ipcRenderer } = window.require("electron");

initializeIcons();
Mousetrap.prototype.stopCallback = () => false;

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={getTheme()}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
