import { INotebookPageController } from "../contexts/INotebookPageController";
import { setCellDataSync } from "../structures/notebook/NotebookManipulation";
import { getCellData } from "../structures/notebook/NotebookQueries";

export function handleTest(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController();
  const notebook = notebookController!.getNotebook()!;
  const activeCell = notebookController!.getActiveCell()!;
  const activePage = notebookController!.getActivePage()!;

  let data = getCellData(notebook, {
    pageId: activePage,
    cellId: activeCell,
  });

  if (data.loading === undefined) data.loading = true;

  notebookController!.doSync(setCellDataSync, {
    pageId: activePage,
    cellId: activeCell,
    data: {
      ...data,
      loading: !data.loading,
    },
  });
}
