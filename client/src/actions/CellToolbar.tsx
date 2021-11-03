import { INotebookController } from "../contexts/NotebookController";

export function handleMoveUp(notebookController: INotebookController) {
  const [activePage, activeCell] = notebookController.getActive();
  if (activePage === undefined || activeCell === undefined) return;
}

export function handleMoveDown(notebookController: INotebookController) {
  const [activePage, activeCell] = notebookController.getActive();
  if (activePage === undefined || activeCell === undefined) return;
}
