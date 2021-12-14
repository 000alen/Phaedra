// ! TODO: Pass AppController to avoid persistence issues

import { INotebookTabController } from "./contexts";

export function saveAction(notebookTabController: INotebookTabController) {
  const notebookManager = notebookTabController.getNotebookManager()!;
  notebookManager.save();
}
