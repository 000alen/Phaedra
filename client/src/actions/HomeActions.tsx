import { INotebookPageController } from "../contexts/NotebookPageController";
import { removeCellSync } from "../structures/NotebookStructure";

export function handleSave(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  notebookController.save();
}

// ! TODO
export function handleInsertPage(
  notebookPageController: INotebookPageController
) {}

// ! TODO
export function handleInsertCell(
  notebookPageController: INotebookPageController
) {}

export function handleDelete(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;

  for (const [pageId, cellIds] of Object.entries(
    notebookController.getSelected()!
  )) {
    for (const cellId of cellIds) {
      notebookController.do(removeCellSync, {
        pageId: pageId,
        cellId: cellId,
      });
    }
  }
}

export function handleUndo(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  notebookController.undo();
}

export function handleRedo(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  notebookController.redo();
}

// ! TODO
export function handleQuestion(
  notebookPageController: INotebookPageController
) {}

// ! TODO
export function handleGenerate(
  notebookPageController: INotebookPageController
) {}
