import { MessageBarType } from "@fluentui/react";

import {
  addMeaningCell,
  addSynonymCell,
  addAntonymCell,
} from "../manipulation/NotebookManipulation";

export function handleMeaning(notebookRef, commandBoxRef, pageController) {
  const { notebookController } = notebookRef.current.state;
  const { activePage } = notebookRef.current.state;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addMeaningCell, {
      word: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    pageController.addMessageBar("No word selected", MessageBarType.error);
  } else {
    pageController.addMessageBar("No page selected", MessageBarType.error);
  }
}

export function handleSynonym(notebookRef, commandBoxRef, pageController) {
  const { notebookController } = notebookRef.current.state;
  const { activePage } = notebookRef.current.state;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addSynonymCell, {
      word: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    pageController.addMessageBar("No word selected", MessageBarType.error);
  } else {
    pageController.addMessageBar("No page selected", MessageBarType.error);
  }
}

export function handleAntonym(notebookRef, commandBoxRef, pageController) {
  const { notebookController } = notebookRef.current.state;
  const { activePage } = notebookRef.current.state;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addAntonymCell, {
      word: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    pageController.addMessageBar("No word selected", MessageBarType.error);
  } else {
    pageController.addMessageBar("No page selected", MessageBarType.error);
  }
}
