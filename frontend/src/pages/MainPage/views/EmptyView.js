import React from "react";
import CardComponent from "../../../components/CardComponent";
import NotebookPage from "../../../pages/NotebookPage";
import { createNotebook } from "../../../NotebookManipulation";

const newIcon = {
  iconName: "FileTemplate",
};

export default function EmptyView({ appController, statusBarRef }) {
  const handleNew = () => {
    const id = appController.getNextTabId();
    const notebook = createNotebook({ name: `Unnamed Notebook ${id}` });

    appController.addTab(
      <NotebookPage
        key={id}
        id={id}
        appController={appController}
        statusBarRef={statusBarRef}
        notebook={notebook}
      />
    );
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
