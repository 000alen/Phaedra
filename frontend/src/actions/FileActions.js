import { getCellData, setCellData } from "../manipulation/NotebookManipulation";

export function handleTest(notebookPageController) {
  const notebookRef = notebookPageController.getNotebookRef();

  const { notebook, activePage, activeCell } = notebookRef.current.state;

  let data = getCellData(notebook, {
    pageId: activePage,
    cellId: activeCell,
  });

  if (data.loading === undefined) data.loading = true;

  notebookRef.current.do(setCellData, {
    pageId: activePage,
    cellId: activeCell,
    data: {
      ...data,
      loading: !data.loading,
    },
  });
}
