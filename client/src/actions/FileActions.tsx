import { INotebookPageController } from "../contexts/INotebookPageController";
import { setCellDataSync } from "../structures/notebook/NotebookManipulation";
import { getCellData } from "../structures/notebook/NotebookQueries";

export function handleTest(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController();
  const notebook = notebookController!.getNotebook()!;

  const [activePage, activeCell] = notebookController!.getActive();
  if (activePage === undefined || activeCell === undefined) return;

  let data = getCellData(notebook, activePage, activeCell);

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