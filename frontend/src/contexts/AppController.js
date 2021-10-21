import React from "react";

export const AppController = React.createContext({
  tabsDo: (action, args) => {},
  clipboardDo: (action, args) => {},
  getStatusBarRef: () => {},
});
