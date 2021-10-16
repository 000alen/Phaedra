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

export function handleSave(notebookRef) {
  const { notebookController } = notebookRef.current.state;
  notebookController.save();
}

export function handleInsertPage(notebookRef, pageController) {
  const { notebookController } = notebookRef.current.state;
  const { activePage } = notebookRef.current.state;

  if (activePage) {
    const activePageIndex = notebookController.do(indexPage, {
      pageId: activePage,
    });
    notebookController.do(insertPage, {
      page: createPage({}),
      index: activePageIndex + 1,
    });
  } else {
    notebookController.do(addPage, {
      page: createPage({}),
    });
  }
}

export function handleInsertCell(notebookRef, pageController) {
  const { notebookController } = notebookRef.current.state;
  const { activePage, activeCell } = notebookRef.current.state;
  if (activeCell) {
    const activeCellIndex = notebookController.do(indexCell, {
      pageId: activePage,
      cellId: activeCell,
    });
    notebookController.do(insertCell, {
      pageId: activePage,
      cell: createCell({}),
      index: activeCellIndex + 1,
    });
  } else if (activePage) {
    notebookController.do(addCell, {
      pageId: activePage,
      cell: createCell({}),
    });
  } else {
    pageController.addMessageBar("No cell selected", MessageBarType.error);
  }
}

export function handleDelete(notebookRef, pageController) {
  const { notebookController } = notebookRef.current.state;
  const { activePage, activeCell } = notebookRef.current.state;

  if (activeCell) {
    notebookController.do(removeCell, {
      pageId: activePage,
      cellId: activeCell,
    });
  } else if (activePage) {
    notebookController.do(removePage, {
      pageId: activePage,
    });
  } else {
    pageController.addMessageBar("No page selected", MessageBarType.error);
  }
}

export function handleUndo(notebookRef) {
  const { notebookController } = notebookRef.current.state;
  notebookController.undo();
}

export function handleRedo(notebookRef) {
  const { notebookController } = notebookRef.current.state;
  notebookController.redo();
}

export function handleCut(notebookRef, pageController, appController) {
  const { notebook, notebookController } = notebookRef.current.state;
  const { activePage, activeCell } = notebookRef.current.state;

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
    pageController.addMessageBar("No cell selected", MessageBarType.error);
  }
}

export function handleCopy(notebookRef, pageController, appController) {
  const { notebook, notebookController } = notebookRef.current.state;
  const { activePage, activeCell } = notebookRef.current.state;

  console.log(activePage, activeCell);

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

    console.log(page);

    appController.clipboardDo(clipboardPush, { element: page });
  } else {
    pageController.addMessageBar("No cell selected", MessageBarType.error);
  }
}

export function handlePaste(notebookRef, pageController, appController) {
  const { notebookController } = notebookRef.current.state;
  const { activePage, activeCell } = notebookRef.current.state;
  if (activeCell) {
    const activeCellIndex = notebookController.do(indexCell, {
      pageId: activePage,
      cellId: activeCell,
    });

    let cell = makeCellUnique(appController.clipboardDo(clipboardTop));
    notebookController.do(insertCell, {
      pageId: activePage,
      cell: cell,
      index: activeCellIndex + 1,
    });
  } else if (activePage) {
    const activePageIndex = notebookController.do(indexPage, {
      pageId: activePage,
    });

    let page = makePageUnique(appController.clipboardDo(clipboardTop));

    notebookController.do(insertPage, {
      page: page,
      index: activePageIndex + 1,
    });
  } else {
    pageController.addMessageBar("No cell selected", MessageBarType.error);
  }
}

export function handleQuestion(notebookRef, commandBoxRef, pageController) {
  const { notebookController } = notebookRef.current.state;
  const { activePage } = notebookRef.current.state;
  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addQuestionCell, {
      question: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    pageController.addMessageBar("No question", MessageBarType.error);
  } else {
    pageController.addMessageBar("No page selected", MessageBarType.error);
  }
}

export function handleGenerate(notebookRef, commandBoxRef, pageController) {
  const { notebookController } = notebookRef.current.state;
  const { activePage } = notebookRef.current.state;
  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addGenerateCell, {
      prompt: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    pageController.addMessageBar("No prompt", MessageBarType.error);
  } else {
    pageController.addMessageBar("No page selected", MessageBarType.error);
  }
}
