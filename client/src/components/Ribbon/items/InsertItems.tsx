import React from "react";

import { CommandBar } from "@fluentui/react";

import {
  handleEntities,
  handleWikipediaImage,
  handleWikipediaSuggestions,
  handleWikipediaSummary,
} from "../../../actions/InsertActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";

export default function InsertItems() {
  const notebookPageController = React.useContext(NotebookPageController);

  const insertItems = [
    {
      key: "entities",
      text: "Entities",
      iconProps: { iconName: "People" },
      onClick: () => handleEntities(notebookPageController),
    },
    {
      key: "wikipedia",
      text: "Wikipedia",
      iconProps: { iconName: "Articles" },
      subMenuProps: {
        items: [
          {
            key: "wikipediaSummary",
            text: "Wikipedia Summary",
            onClick: () => handleWikipediaSummary(notebookPageController),
          },
          {
            key: "wikipediaSuggestions",
            text: "Wikipedia Suggestions",
            onClick: () => handleWikipediaSuggestions(notebookPageController),
          },
          {
            key: "wikipediaImage",
            text: "Wikipedia Image",
            onClick: () => handleWikipediaImage(notebookPageController),
          },
        ],
      },
    },
  ];

  return <CommandBar items={insertItems} />;
}
