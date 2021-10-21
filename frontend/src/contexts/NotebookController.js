import React from "react";

export const NotebookController = React.createContext({
  save: () => {},
  handleSelection: () => {},
  toggleEditing: () => {},
  undo: () => {},
  redo: () => {},
  do: () => {},
  getNotebookPageController: () => {},
});
