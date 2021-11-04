import { MessageBarType } from "@fluentui/react";

import { INotebookPageController } from "../contexts/NotebookPageController";
import { strings } from "../resources/strings";
import { addMessage, createMessage } from "../structures/MessagesStructure";
import {
  addAntonymCell,
  addMeaningCell,
  addSynonymCell,
} from "../structures/NotebookStructure";

export function handleMeaning(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  const [activePage] = notebookController.getActive();

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
        text: strings.noWord,
      }),
    });
  } else {
    // TODO: Select page on viewport
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}

export function handleSynonym(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  const [activePage] = notebookController.getActive();

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
        text: strings.noWord,
      }),
    });
  } else {
    // TODO: Select page on viewport
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}

export function handleAntonym(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  const [activePage] = notebookController.getActive();

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
        text: strings.noWord,
      }),
    });
  } else {
    // TODO: Select page on viewport
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}
