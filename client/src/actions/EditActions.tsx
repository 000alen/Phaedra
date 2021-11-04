import { INotebookPageController } from "../contexts/NotebookPageController";
import { getCellData, setCellDataSync } from "../structures/NotebookStructure";

export function handleSeamless(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const notebook = notebookController.getNotebook()!;

  for (const [pageId, cellIds] of Object.entries(
    notebookController.getSelected()!
  )) {
    for (const cellId of cellIds) {
      const data = getCellData(notebook, pageId, cellId);

      if (data.seamless === undefined) data.seamless = false;

      notebookController!.do(setCellDataSync, {
        pageId: pageId,
        cellId: cellId,
        data: {
          ...data,
          seamless: !data.seamless,
        },
      });
    }
  }
}

export function handleEdit(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  if (notebookController.isEditing()) {
    notebookController.exitEditing();
  } else {
    notebookController.enterEditing();
  }
}
