import React from "react";

import { CommandBar } from "@fluentui/react";

import {
  handleEntities,
  handleWikipediaImage,
  handleWikipediaSuggestions,
  handleWikipediaSummary,
} from "../../../actions/InsertActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";
import { strings } from "../../../resources/strings";

export default function InsertItems() {
  const notebookPageController = React.useContext(NotebookPageController);

  const insertItems = [
    {
      key: "entities",
      text: strings.entitiesButtonLabel,
      iconProps: { iconName: "People" },
      onClick: () => handleEntities(notebookPageController),
    },
    {
      key: "wikipedia",
      text: strings.wikipediaButtonLabel,
      iconProps: { iconName: "Articles" },
      subMenuProps: {
        items: [
          {
            key: "wikipediaSummary",
            text: strings.wikipediaSummaryButtonLabel,
            onClick: () => handleWikipediaSummary(notebookPageController),
          },
          {
            key: "wikipediaSuggestions",
            text: strings.wikipediaSuggestionsButtonLabel,
            onClick: () => handleWikipediaSuggestions(notebookPageController),
          },
          {
            key: "wikipediaImage",
            text: strings.wikipediaImageButtonLabel,
            onClick: () => handleWikipediaImage(notebookPageController),
          },
        ],
      },
    },
  ];

  return <CommandBar items={insertItems} />;
}
