import React from "react";
import { CommandBar } from "@fluentui/react";
import {
  handleMeaning,
  handleSynonym,
  handleAntonym,
} from "../../../actions/ReviewActions";
import { NotebookPageController } from "../../../pages/NotebookPage/NotebookPageController";

export default function ReviewItems() {
  const notebookPageController = React.useContext(NotebookPageController);
  const notebookRef = notebookPageController.getNotebookRef();
  const commandBoxRef = notebookPageController.getCommandBoxRef();

  const reviewItems = [
    {
      key: "dictionary",
      text: "Dictionary",
      iconProps: { iconName: "Dictionary" },
      subMenuProps: {
        items: [
          {
            key: "meaning",
            text: "Meaning",
            onClick: () =>
              handleMeaning(notebookRef, commandBoxRef, notebookPageController),
          },
          {
            key: "synonyms",
            text: "Synonyms",
            onClick: () =>
              handleSynonym(notebookRef, commandBoxRef, notebookPageController),
          },
          {
            key: "antonyms",
            text: "Antonyms",
            onClick: () =>
              handleAntonym(notebookRef, commandBoxRef, notebookPageController),
          },
        ],
      },
    },
  ];

  return <CommandBar items={reviewItems} />;
}
