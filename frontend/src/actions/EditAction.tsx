import { INotebookPageController } from "../contexts/INotebookPageController";
import { getCellData, setCellData } from "../manipulation/NotebookManipulation";

export function handleSeamless(
  notebookPageController: INotebookPageController
) {
  const notebookRef = notebookPageController.getNotebookRef();
  const { notebook, activePage, activeCell } = notebookRef!.current!.state;

  let data = getCellData(notebook, {
    pageId: activePage,
    cellId: activeCell,
  });

  if (data.seamless === undefined) data.seamless = false;

  notebookRef!.current!.do(setCellData, {
    pageId: activePage,
    cellId: activeCell,
    data: {
      ...data,
      seamless: !data.seamless,
    },
  });
}

export function handleEdit(notebookPageController: INotebookPageController) {
  console.log(notebookPageController);

  const notebookRef = notebookPageController.getNotebookRef();

  notebookRef!.current!.toggleEditing();
}
