import { createTheme, Theme } from "@fluentui/react";

export const lightTheme = createTheme({
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

// ! TODO Compatibility
export const darkTheme = createTheme({
  palette: {
    themePrimary: "#ff00d0",
    themeLighterAlt: "#0a0008",
    themeLighter: "#290021",
    themeLight: "#4d003e",
    themeTertiary: "#99007d",
    themeSecondary: "#e000b7",
    themeDarkAlt: "#ff19d5",
    themeDark: "#ff3ddb",
    themeDarker: "#ff70e5",
    neutralLighterAlt: "#282828",
    neutralLighter: "#313131",
    neutralLight: "#3f3f3f",
    neutralQuaternaryAlt: "#484848",
    neutralQuaternary: "#4f4f4f",
    neutralTertiaryAlt: "#6d6d6d",
    neutralTertiary: "#c8c8c8",
    neutralSecondary: "#d0d0d0",
    neutralPrimaryAlt: "#dadada",
    neutralPrimary: "#ffffff",
    neutralDark: "#f4f4f4",
    black: "#f8f8f8",
    white: "#1f1f1f",
  },
});

export function getTheme(): Theme {
  return lightTheme;
}
