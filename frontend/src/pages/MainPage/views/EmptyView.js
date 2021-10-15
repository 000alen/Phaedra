import React from "react";
import { v4 as uuidv4 } from "uuid";

import CardComponent from "../../../components/CardComponent";

import NotebookPage from "../../../pages/NotebookPage";

import { createNotebook } from "../../../manipulation/NotebookManipulation";
import { addTab, createTab } from "../../../manipulation/TabsManipulation";

const newIcon = {
  iconName: "FileTemplate",
};

export default function EmptyView({ id, appController, statusBarRef }) {
  const handleNew = () => {
    const id = uuidv4();
    const notebook = createNotebook({ name: `Unnamed Notebook ${id}` });

    appController.tabsDo(addTab, {
      tab: createTab({
        content: (
          <NotebookPage
            key={id}
            id={id}
            appController={appController}
            statusBarRef={statusBarRef}
            notebook={notebook}
          />
        ),
      }),
    });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-row space-x-1">
        <CardComponent
          iconProps={newIcon}
          title="Create Notebook"
          subtitle="Create a JSON Notebook"
          onClick={handleNew}
        />
      </div>
    </div>
  );
}
