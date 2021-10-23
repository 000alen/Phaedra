import React from "react";

import { CommandBar } from "@fluentui/react";

import {
  handleAntonym,
  handleMeaning,
  handleSynonym,
} from "../../../actions/ReviewActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";

export default function ReviewItems() {
  const notebookPageController = React.useContext(NotebookPageController);

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
            onClick: () => handleMeaning(notebookPageController),
          },
          {
            key: "synonyms",
            text: "Synonyms",
            onClick: () => handleSynonym(notebookPageController),
          },
          {
            key: "antonyms",
            text: "Antonyms",
            onClick: () => handleAntonym(notebookPageController),
          },
        ],
      },
    },
  ];

  return <CommandBar items={reviewItems} />;
}
