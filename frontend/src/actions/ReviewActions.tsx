import { MessageBarType } from "@fluentui/react";

import { INotebookPageController } from "../contexts/INotebookPageController";
import {
  addMessage,
  createMessage,
} from "../manipulation/MessagesManipulation";
import {
  addAntonymCell,
  addMeaningCell,
  addSynonymCell,
} from "../manipulation/NotebookManipulation";

export function handleMeaning(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;
  const activePage = notebookController?.getActivePage()!;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addMeaningCell, {
      word: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No word",
      }),
    });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No active page or cell",
      }),
    });
  }
}

export function handleSynonym(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;
  const activePage = notebookController.getActivePage()!;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addSynonymCell, {
      word: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No word",
      }),
    });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No active page or cell",
      }),
    });
  }
}

export function handleAntonym(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  const activePage = notebookController.getActivePage()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addAntonymCell, {
      word: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No word",
      }),
    });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No active page or cell",
      }),
    });
  }
}
