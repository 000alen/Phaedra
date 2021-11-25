import "./css/index.css";

import React from "react";
import ReactDOM from "react-dom";

import { initializeIcons, ThemeProvider } from "@fluentui/react";

import { App } from "./App";
import { getTheme } from "./themes";

export const { ipcRenderer } = window.require("electron");

initializeIcons();

// @ts-ignore
const app = <App />;

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={getTheme()}>{app}</ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
