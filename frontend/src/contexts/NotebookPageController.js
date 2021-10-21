import React from "react";

export const NotebookPageController = React.createContext({
  showCommandBox: () => {},
  hideCommandBox: () => {},
  addMessageBar: (text, type) => {},
  removeMessageBar: (id) => {},
  getNotebookRef: () => {},
  getCommandBoxRef: () => {},
  getAppController: () => {},
});
