import "./css/index.css";

import React from "react";
import ReactDOM from "react-dom";

import { initializeIcons, ThemeProvider } from "@fluentui/react";

import { Application } from "./App";
import { getTheme } from "./resources/theme";

export const { ipcRenderer } = window.require("electron");

initializeIcons();

// @ts-ignore
const application = <Application />;

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={getTheme()}>{application}</ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
