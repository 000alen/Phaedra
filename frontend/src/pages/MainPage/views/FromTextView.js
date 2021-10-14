import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import CardComponent from "../../../components/CardComponent";

import { addTab, createTab } from "../../../manipulation/TabsManipulation";

import NotebookPage from "../../../pages/NotebookPage";

import { openText } from "../../../NotebookIO";

const openIcon = {
  iconName: "OpenFile",
};

export default function FromTextView({ appController, statusBarRef }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = () => {
    if (dialogOpen) return;
    setDialogOpen(true);

    openText().then(({ notebook }) => {
      setDialogOpen(false);
      if (!notebook) return;

      const id = uuidv4();

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
    });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-row space-x-1">
        <CardComponent
          iconProps={openIcon}
          title="Open text file"
          subtitle="Create a Notebook from a text file"
          onClick={handleOpen}
        />
      </div>
    </div>
  );
}
