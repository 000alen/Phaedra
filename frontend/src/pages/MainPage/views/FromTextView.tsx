import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import CardComponent from "../../../components/CardComponent";

import { addTab, createTab } from "../../../manipulation/TabsManipulation";

import NotebookPage from "../../NotebookPage/NotebookPage";

import { openText } from "../../../IO/NotebookIO";
import { AppController } from "../../../contexts/AppController";

const openIcon = {
  iconName: "OpenFile",
};

interface FromTextViewProps {
  id: string;
}

export default function FromTextView({ id }: FromTextViewProps) {
  const appController = React.useContext(AppController);

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
          content: <NotebookPage key={id} id={id} notebook={notebook} />,
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
