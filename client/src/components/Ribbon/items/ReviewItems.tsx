import React from "react";

import { CommandBar } from "@fluentui/react";

import {
  handleAntonym,
  handleMeaning,
  handleSynonym,
} from "../../../actions/ReviewActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";
import { strings } from "../../../resources/strings";

export default function ReviewItems() {
  const notebookPageController = React.useContext(NotebookPageController);

  const reviewItems = [
    {
      key: "dictionary",
      text: strings.dictionaryButtonLabel,
      iconProps: { iconName: "Dictionary" },
      subMenuProps: {
        items: [
          {
            key: "meaning",
            text: strings.meaningButtonLabel,
            onClick: () => handleMeaning(notebookPageController),
          },
          {
            key: "synonyms",
            text: strings.synonymsButtonLabel,
            onClick: () => handleSynonym(notebookPageController),
          },
          {
            key: "antonyms",
            text: strings.antonymsButtonLabel,
            onClick: () => handleAntonym(notebookPageController),
          },
        ],
      },
    },
  ];

  return <CommandBar items={reviewItems} />;
}
