import { INotebookPageController } from "../contexts/INotebookPageController";
import { setCellDataSync } from "../structures/notebook/NotebookManipulation";
import { getCellData } from "../structures/notebook/NotebookQueries";

export function handleSeamless(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController();
  const notebook = notebookController!.getNotebook()!;

  const [activePage, activeCell] = notebookController!.getActive();
  if (activePage === undefined || activeCell === undefined) return;

  let data = getCellData(notebook, activePage, activeCell);

  if (data.seamless === undefined) data.seamless = false;

  notebookController!.doSync(setCellDataSync, {
    pageId: activePage,
    cellId: activeCell,
    data: {
      ...data,
      seamless: !data.seamless,
    },
  });
}

export function handleEdit(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController();

  notebookController!.toggleEditing();
}
