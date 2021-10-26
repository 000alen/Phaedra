import { MessageBarType } from "@fluentui/react";

import { INotebookPageController } from "../contexts/INotebookPageController";
import {
  clipboardPush,
  clipboardTop,
  makeCellUnique,
  makePageUnique,
} from "../manipulation/ClipboardManipulation";
import { ICell, IPage } from "../manipulation/INotebookManipulation";
import {
  addMessage,
  createMessage,
} from "../manipulation/MessagesManipulation";
import {
  addCell,
  addGenerateCell,
  addPage,
  addQuestionCell,
  createCell,
  createPage,
  getCell,
  getPage,
  indexCell,
  indexPage,
  insertCell,
  insertPage,
  isCell,
  isPage,
  removeCell,
  removePage,
} from "../manipulation/NotebookManipulation";
import { strings } from "../strings";

export function handleSave(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;

  notebookController.save();
}

export function handleInsertPage(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const notebook = notebookController.getNotebook()!;
  const activePage = notebookController.getActivePage();

  if (activePage) {
    const activePageIndex = indexPage(notebook, {
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

export function handleInsertCell(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const notebook = notebookController.getNotebook()!;
  const activeCell = notebookController.getActiveCell()!;
  const activePage = notebookController.getActivePage()!;

  if (activeCell) {
    const activeCellIndex = indexCell(notebook, {
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
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}

export function handleDelete(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  const activeCell = notebookController.getActiveCell()!;
  const activePage = notebookController.getActivePage()!;

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
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}

export function handleUndo(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;

  notebookController.undo();
}

export function handleRedo(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;

  notebookController.redo();
}

export function handleCut(notebookPageController: INotebookPageController) {
  const appController = notebookPageController.getAppController()!;
  const notebookController = notebookPageController.getNotebookController()!;
  const notebook = notebookController.getNotebook()!;
  const activeCell = notebookController.getActiveCell()!;
  const activePage = notebookController.getActivePage()!;

  if (activeCell) {
    const cell = getCell(notebook, {
      pageId: activePage,
      cellId: activeCell,
    });
    appController.clipboardDo(clipboardPush, { element: cell! });
    notebookController.do(removeCell, {
      pageId: activePage,
      cellId: activeCell,
    });
  } else if (activePage) {
    const page = getPage(notebook, {
      pageId: activePage,
    });
    appController.clipboardDo(clipboardPush, { element: page! });
    notebookController.do(removePage, {
      pageId: activePage,
    });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}

export function handleCopy(notebookPageController: INotebookPageController) {
  const appController = notebookPageController.getAppController()!;
  const notebookController = notebookPageController.getNotebookController()!;
  const notebook = notebookController.getNotebook()!;
  const activeCell = notebookController.getActiveCell()!;
  const activePage = notebookController.getActivePage()!;

  if (activeCell) {
    const cell = getCell(notebook, {
      pageId: activePage,
      cellId: activeCell,
    });
    appController.clipboardDo(clipboardPush, { element: cell! });
  } else if (activePage) {
    const page = getPage(notebook, {
      pageId: activePage,
    });
    appController.clipboardDo(clipboardPush, { element: page! });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}

export function handlePaste(notebookPageController: INotebookPageController) {
  const appController = notebookPageController.getAppController()!;
  const notebookController = notebookPageController.getNotebookController()!;
  const top = clipboardTop(appController.getClipboard()!);
  const notebook = notebookController.getNotebook()!;
  const activeCell = notebookController.getActiveCell()!;
  const activePage = notebookController.getActivePage()!;

  if (isCell(top)) {
    const cell = makeCellUnique(top as ICell);
    if (activeCell) {
      const index =
        indexCell(notebook, {
          pageId: activePage,
          cellId: activeCell,
        }) + 1;
      notebookController.do(insertCell, {
        pageId: activePage,
        cell: cell,
        index,
      });
    } else if (activePage) {
      notebookController.do(addCell, {
        pageId: activePage,
        cell: cell,
      });
    } else {
      notebookPageController.messagesDo(addMessage, {
        message: createMessage({
          type: MessageBarType.error,
          text: strings.noActiveCellOrPage,
        }),
      });
    }
  } else if (isPage(top)) {
    const page = makePageUnique(top as IPage);
    if (activePage) {
      const index =
        indexPage(notebook, {
          pageId: activePage,
        }) + 1;
      notebookController.do(insertPage, {
        page: page,
        index,
      });
    } else {
      notebookPageController.messagesDo(addMessage, {
        message: createMessage({
          type: MessageBarType.error,
          text: strings.noActiveCellOrPage,
        }),
      });
    }
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.unknownError,
      }),
    });
  }
}

export function handleQuestion(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const activePage = notebookController.getActivePage()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  if (activePage && commandBoxRef!.current) {
    const { command } = commandBoxRef!.current.state;
    notebookController.do(addQuestionCell, {
      question: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noQuestion,
      }),
    });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}

export function handleGenerate(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const activePage = notebookController.getActivePage()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  if (activePage && commandBoxRef!.current) {
    const { command } = commandBoxRef!.current.state;
    notebookController.do(addGenerateCell, {
      prompt: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noPrompt,
      }),
    });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}
