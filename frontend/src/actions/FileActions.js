import { getCellData, setCellData } from "../manipulation/NotebookManipulation";

export function handleTest(notebookRef) {
  const { notebookController, notebook } = notebookRef.current.state;
  const { activePage, activeCell } = notebookRef.current.state;

  let data = getCellData(notebook, {
    pageId: activePage,
    cellId: activeCell,
  });

  if (data.loading === undefined) data.loading = true;

  notebookController.do(setCellData, {
    pageId: activePage,
    cellId: activeCell,
    data: {
      ...data,
      loading: !data.loading,
    },
  });
}
