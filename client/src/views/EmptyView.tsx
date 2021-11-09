import React from "react";
import { v4 as uuidv4 } from "uuid";

import CardComponent from "../components/CardComponent";
import { AppController } from "../contexts/AppController";
import { MainPageViewProps } from "../pages/MainPage";
import NotebookPage from "../pages/NotebookPage";
import { strings } from "../resources/strings";
import { createNotebook } from "../structures/NotebookStructure";

const newIcon = {
  iconName: "FileTemplate",
};

export default function EmptyView({ id }: MainPageViewProps) {
  const appController = React.useContext(AppController);

  const handleNew = () => {
    const id = uuidv4();
    // TODO
    const notebook = createNotebook({ name: `Unnamed Notebook ${id}` });

    appController.addTab({
      id: id,
      title: strings.newTabTitle,
      content: <NotebookPage key={id} id={id} notebook={notebook} />,
    });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-row space-x-1">
        <CardComponent
          iconProps={newIcon}
          title={strings.createNotebookButtonLabel}
          subtitle={strings.createNotebookButtonDescription}
          onClick={handleNew}
        />
      </div>
    </div>
  );
}
