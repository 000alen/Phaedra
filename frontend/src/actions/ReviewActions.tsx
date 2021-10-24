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
  const notebookRef = notebookPageController.getNotebookRef();
  const commandBoxRef = notebookPageController.getCommandBoxRef();
  const { activePage } = notebookRef!.current!.state;
  if (activePage && commandBoxRef!.current!) {
    const { command } = commandBoxRef!.current!.state;
    notebookRef!.current!.do(addMeaningCell, {
      word: command,
      pageId: activePage,
    });
    commandBoxRef!.current!.consume();
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
  const notebookRef = notebookPageController.getNotebookRef();
  const commandBoxRef = notebookPageController.getCommandBoxRef();
  const { activePage } = notebookRef!.current!.state;
  if (activePage && commandBoxRef!.current!) {
    const { command } = commandBoxRef!.current!.state;
    notebookRef!.current!.do(addSynonymCell, {
      word: command,
      pageId: activePage,
    });
    commandBoxRef!.current!.consume();
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
  const notebookRef = notebookPageController.getNotebookRef();
  const commandBoxRef = notebookPageController.getCommandBoxRef();
  const { activePage } = notebookRef!.current!.state;
  if (activePage && commandBoxRef!.current) {
    const { command } = commandBoxRef!.current.state;
    notebookRef!.current!.do(addAntonymCell, {
      word: command,
      pageId: activePage,
    });
    commandBoxRef!.current.consume();
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
