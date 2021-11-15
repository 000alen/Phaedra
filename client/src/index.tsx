import "./css/index.css";

import React from "react";
import ReactDOM from "react-dom";

import { initializeIcons, ThemeProvider } from "@fluentui/react";

import { App } from "./App";
import { getTheme } from "./resources/theme";

export const { ipcRenderer } = window.require("electron");

initializeIcons();

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={getTheme()}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
