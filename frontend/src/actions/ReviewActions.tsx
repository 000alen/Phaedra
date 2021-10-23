import { MessageBarType } from "@fluentui/react";
import { INotebookPageController } from "../contexts/NotebookPageController";

import {
  addMeaningCell,
  addSynonymCell,
  addAntonymCell,
} from "../manipulation/NotebookManipulation";

export function handleMeaning(notebookPageController: INotebookPageController) {
  // const notebookRef = notebookPageController.getNotebookRef();
  // const commandBoxRef = notebookPageController.getCommandBoxRef();
  // const { activePage } = notebookRef.current.state;
  // if (activePage && commandBoxRef.current) {
  //   const { command } = commandBoxRef.current.state;
  //   notebookRef.current.do(addMeaningCell, {
  //     word: command,
  //     pageId: activePage,
  //   });
  //   commandBoxRef.current.consume();
  // } else if (activePage) {
  //   notebookPageController.addMessageBar(
  //     "No word selected",
  //     MessageBarType.error
  //   );
  // } else {
  //   notebookPageController.addMessageBar(
  //     "No page selected",
  //     MessageBarType.error
  //   );
  // }
}

export function handleSynonym(notebookPageController: INotebookPageController) {
  // const notebookRef = notebookPageController.getNotebookRef();
  // const commandBoxRef = notebookPageController.getCommandBoxRef();
  // const { activePage } = notebookRef.current.state;
  // if (activePage && commandBoxRef.current) {
  //   const { command } = commandBoxRef.current.state;
  //   notebookRef.current.do(addSynonymCell, {
  //     word: command,
  //     pageId: activePage,
  //   });
  //   commandBoxRef.current.consume();
  // } else if (activePage) {
  //   notebookPageController.addMessageBar(
  //     "No word selected",
  //     MessageBarType.error
  //   );
  // } else {
  //   notebookPageController.addMessageBar(
  //     "No page selected",
  //     MessageBarType.error
  //   );
  // }
}

export function handleAntonym(notebookPageController: INotebookPageController) {
  // const notebookRef = notebookPageController.getNotebookRef();
  // const commandBoxRef = notebookPageController.getCommandBoxRef();
  // const { activePage } = notebookRef.current.state;
  // if (activePage && commandBoxRef.current) {
  //   const { command } = commandBoxRef.current.state;
  //   notebookRef.current.do(addAntonymCell, {
  //     word: command,
  //     pageId: activePage,
  //   });
  //   commandBoxRef.current.consume();
  // } else if (activePage) {
  //   notebookPageController.addMessageBar(
  //     "No word selected",
  //     MessageBarType.error
  //   );
  // } else {
  //   notebookPageController.addMessageBar(
  //     "No page selected",
  //     MessageBarType.error
  //   );
  // }
}
