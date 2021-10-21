import { MessageBarType } from "@fluentui/react";

import {
  clipboardPush,
  clipboardTop,
  makeCellUnique,
  makePageUnique,
} from "../manipulation/ClipboardManipulation";
import {
  createPage,
  createCell,
  indexPage,
  insertPage,
  indexCell,
  insertCell,
  removeCell,
  addQuestionCell,
  addGenerateCell,
  getCell,
  addCell,
  addPage,
  removePage,
  getPage,
} from "../manipulation/NotebookManipulation";

export function handleSave(notebookController) {
  const notebookRef = notebookController.getNotebookRef();

  notebookRef.current.save();
}

export function handleInsertPage(notebookPageController) {
  const notebookRef = notebookPageController.getNotebookRef();

  const { activePage } = notebookRef.current.state;
  if (activePage) {
    const activePageIndex = notebookRef.current.do(indexPage, {
      pageId: activePage,
    });
    notebookRef.current.do(insertPage, {
      page: createPage({}),
      index: activePageIndex + 1,
    });
  } else {
    notebookRef.current.do(addPage, {
      page: createPage({}),
    });
  }
}

export function handleInsertCell(notebookPageController) {
  const notebookRef = notebookPageController.getNotebookRef();

  const { activePage, activeCell } = notebookRef.current.state;
  if (activeCell) {
    const activeCellIndex = notebookRef.current.do(indexCell, {
      pageId: activePage,
      cellId: activeCell,
    });
    notebookRef.current.do(insertCell, {
      pageId: activePage,
      cell: createCell({}),
      index: activeCellIndex + 1,
    });
  } else if (activePage) {
    notebookRef.current.do(addCell, {
      pageId: activePage,
      cell: createCell({}),
    });
  } else {
    notebookPageController.addMessageBar(
      "No cell selected",
      MessageBarType.error
    );
  }
}

export function handleDelete(notebookPageController) {
  const notebookRef = notebookPageController.getNotebookRef();

  const { activePage, activeCell } = notebookRef.current.state;
  if (activeCell) {
    notebookRef.current.do(removeCell, {
      pageId: activePage,
      cellId: activeCell,
    });
  } else if (activePage) {
    notebookRef.current.do(removePage, {
      pageId: activePage,
    });
  } else {
    notebookPageController.addMessageBar(
      "No page selected",
      MessageBarType.error
    );
  }
}

export function handleUndo(notebookPageController) {
  const notebookRef = notebookPageController.getNotebookRef();

  notebookRef.current.undo();
}

export function handleRedo(notebookPageController) {
  const notebookRef = notebookPageController.getNotebookRef();

  notebookRef.current.redo();
}

export function handleCut(notebookPageController) {
  const appController = notebookPageController.getAppController();
  const notebookRef = notebookPageController.getNotebookRef();

  const { notebook, notebookController, activePage, activeCell } =
    notebookRef.current.state;

  if (activeCell) {
    const cell = getCell(notebook, {
      pageId: activePage,
      cellId: activeCell,
    });
    appController.clipboardDo(clipboardPush, { element: cell });
    notebookController.do(removeCell, {
      pageId: activePage,
      cellId: activeCell,
    });
  } else if (activePage) {
    const page = getPage(notebook, {
      pageId: activePage,
    });
    appController.clipboardDo(clipboardPush, { element: page });
    notebookController.do(removePage, {
      pageId: activePage,
    });
  } else {
    notebookPageController.addMessageBar(
      "No cell selected",
      MessageBarType.error
    );
  }
}

export function handleCopy(notebookPageController) {
  const appController = notebookPageController.getAppController();
  const notebookRef = notebookPageController.getNotebookRef();

  const { notebook, activePage, activeCell } = notebookRef.current.state;

  if (activeCell) {
    const cell = getCell(notebook, {
      pageId: activePage,
      cellId: activeCell,
    });
    appController.clipboardDo(clipboardPush, { element: cell });
  } else if (activePage) {
    const page = getPage(notebook, {
      pageId: activePage,
    });
    appController.clipboardDo(clipboardPush, { element: page });
  } else {
    notebookPageController.addMessageBar(
      "No cell selected",
      MessageBarType.error
    );
  }
}

export function handlePaste(notebookPageController) {
  const appController = notebookPageController.getAppController();
  const notebookRef = notebookPageController.getNotebookRef();

  const { activePage, activeCell } = notebookRef.current.state;

  if (activeCell) {
    const activeCellIndex = notebookRef.current.do(indexCell, {
      pageId: activePage,
      cellId: activeCell,
    });
    let cell = makeCellUnique(appController.clipboardDo(clipboardTop));
    notebookRef.current.do(insertCell, {
      pageId: activePage,
      cell: cell,
      index: activeCellIndex + 1,
    });
  } else if (activePage) {
    const activePageIndex = notebookRef.current.do(indexPage, {
      pageId: activePage,
    });
    let page = makePageUnique(appController.clipboardDo(clipboardTop));
    notebookRef.current.do(insertPage, {
      page: page,
      index: activePageIndex + 1,
    });
  } else {
    notebookPageController.addMessageBar(
      "No cell selected",
      MessageBarType.error
    );
  }
}

export function handleQuestion(notebookPageController) {
  const notebookRef = notebookPageController.getNotebookRef();
  const commandBoxRef = notebookPageController.getCommandBoxRef();

  const { activePage } = notebookRef.current.state;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookRef.current.do(addQuestionCell, {
      question: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.addMessageBar("No question", MessageBarType.error);
  } else {
    notebookPageController.addMessageBar(
      "No page selected",
      MessageBarType.error
    );
  }
}

export function handleGenerate(notebookPageController) {
  const notebookRef = notebookPageController.getNotebookRef();
  const commandBoxRef = notebookPageController.getCommandBoxRef();

  const { activePage } = notebookRef.current.state;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookRef.current.do(addGenerateCell, {
      prompt: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.addMessageBar("No prompt", MessageBarType.error);
  } else {
    notebookPageController.addMessageBar(
      "No page selected",
      MessageBarType.error
    );
  }
}
