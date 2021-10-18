import { setCellData, getCellData } from "../manipulation/NotebookManipulation";

export function handleSeamless(notebookRef) {
  const { notebookController, notebook } = notebookRef.current.state;
  const { activePage, activeCell } = notebookRef.current.state;

  let data = getCellData(notebook, {
    pageId: activePage,
    cellId: activeCell,
  });

  if (data.seamless === undefined) data.seamless = false;

  notebookController.do(setCellData, {
    pageId: activePage,
    cellId: activeCell,
    data: {
      ...data,
      seamless: !data.seamless,
    },
  });
}

export function handleEdit(notebookRef) {
  const { notebookController } = notebookRef.current.state;
  notebookController.toggleEditing();
}
