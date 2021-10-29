import { INotebookPageController } from "../contexts/INotebookPageController";
import { setCellData } from "../structures/notebook/NotebookManipulation";
import { getCellData } from "../structures/notebook/NotebookQueries";

export function handleSeamless(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController();
  const notebook = notebookController!.getNotebook()!;
  const activePage = notebookController!.getActivePage()!;
  const activeCell = notebookController!.getActiveCell()!;

  let data = getCellData(notebook, {
    pageId: activePage,
    cellId: activeCell,
  });

  if (data.seamless === undefined) data.seamless = false;

  notebookController!.do(setCellData, {
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
