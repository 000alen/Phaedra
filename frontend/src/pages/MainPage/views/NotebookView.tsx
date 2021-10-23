import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import CardComponent from "../../../components/CardComponent";
import { AppController } from "../../../contexts/AppController";
import { openJson } from "../../../IO/NotebookIO";
import { addTab, createTab } from "../../../manipulation/TabsManipulation";
import NotebookPage from "../../NotebookPage";
import { MainPageViewProps } from "../IMainPage";

const openIcon = {
  iconName: "OpenFile",
};

export default function NotebookView({ id }: MainPageViewProps) {
  const appController = React.useContext(AppController);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = () => {
    if (dialogOpen) return;
    setDialogOpen(true);

    openJson().then(({ notebook, notebookPath }) => {
      setDialogOpen(false);
      if (!notebook) return;

      const id = uuidv4();

      appController.tabsDo(addTab, {
        tab: createTab({
          content: (
            <NotebookPage
              key={id}
              id={id}
              notebook={notebook}
              notebookPath={notebookPath}
            />
          ),
        }),
      });
    });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-row space-x-1">
        <CardComponent
          iconProps={openIcon}
          title="Open Notebook"
          subtitle="Open a JSON Notebook"
          onClick={handleOpen}
        />
      </div>
    </div>
  );
}
