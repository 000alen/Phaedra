import { INotebookController } from "../contexts/NotebookController";
import { indexCell, moveCellSync } from "../structures/NotebookStructure";

export function handleMoveUp(notebookController: INotebookController) {
  const [activePage, activeCell] = notebookController.getActive();
  if (activePage === undefined || activeCell === undefined) return;

  const notebook = notebookController.getNotebook();
  const cellIndex = indexCell(notebook!, activePage, activeCell);

  notebookController.doSync(moveCellSync, {
    pageId: activePage,
    cellId: activeCell,
    index: cellIndex - 1,
  });
}

export function handleMoveDown(notebookController: INotebookController) {
  const [activePage, activeCell] = notebookController.getActive();
  if (activePage === undefined || activeCell === undefined) return;

  const notebook = notebookController.getNotebook();
  const cellIndex = indexCell(notebook!, activePage, activeCell);

  notebookController.doSync(moveCellSync, {
    pageId: activePage,
    cellId: activeCell,
    index: cellIndex + 1,
  });
}
