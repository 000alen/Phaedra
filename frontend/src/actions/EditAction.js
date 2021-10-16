import { setCellData } from "../manipulation/NotebookManipulation";

export function handleSeamless(notebookRef) {
  const { notebookController } = notebookRef.current.state;
  const { activePage, activeCell } = notebookRef.current.state;
  notebookController.do(setCellData, {
    pageId: activePage,
    cellId: activeCell,
    data: { seamless: true },
  });
}

export function handleEdit(notebookRef) {
  const { notebookController } = notebookRef.current.state;
  notebookController.toggleEditing();
}
