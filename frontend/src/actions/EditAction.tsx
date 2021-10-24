import { INotebookPageController } from "../contexts/INotebookPageController";
import { getCellData, setCellData } from "../manipulation/NotebookManipulation";

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
