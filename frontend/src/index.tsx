import React from "react";
import ReactDOM from "react-dom";
import { initializeIcons, ThemeProvider, createTheme } from "@fluentui/react";

import App from "./App";

import "./css/index.css";
import "./css/tailwind.output.css";

export const { ipcRenderer } = window.require("electron");

export const theme = createTheme({
  palette: {
    themePrimary: "#933bff",
    themeLighterAlt: "#fbf7ff",
    themeLighter: "#eee0ff",
    themeLight: "#dfc4ff",
    themeTertiary: "#be89ff",
    themeSecondary: "#a052ff",
    themeDarkAlt: "#8435e6",
    themeDark: "#702dc2",
    themeDarker: "#52218f",
    neutralLighterAlt: "#f8f8f8",
    neutralLighter: "#f4f4f4",
    neutralLight: "#eaeaea",
    neutralQuaternaryAlt: "#dadada",
    neutralQuaternary: "#d0d0d0",
    neutralTertiaryAlt: "#c8c8c8",
    neutralTertiary: "#595959",
    neutralSecondary: "#373737",
    neutralPrimaryAlt: "#2f2f2f",
    neutralPrimary: "#000000",
    neutralDark: "#151515",
    black: "#0b0b0b",
    white: "#ffffff",
  },
});

window.localStorage.clear();

initializeIcons();

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
