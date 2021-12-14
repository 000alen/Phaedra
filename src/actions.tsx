// TODO(#43): Standardize actions interface
//  Pass actions a global interface (like AppController) instead of the
//  interface from the level it's invoked from

import { INotebookTabController } from "./contexts";

export function saveAction(notebookTabController: INotebookTabController) {
  const notebookManager = notebookTabController.getNotebookManager()!;
  notebookManager.save();
}
