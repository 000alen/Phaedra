import React from "react";

import { useContainer } from "@pixore/subdivide";

import { Editor } from "./Editor";
import { PageLayoutSelector } from "./PageLayoutSelector";
import { Paper } from "./Paper";

interface PageLayoutMasterProps {
  id: string;
  onReferencesChange: (...args: any[]) => void;
  onDataChange: (...args: any[]) => void;
  onContentChange: (...args: any[]) => void;
}

export function PageLayoutMaster({
  id,
  onReferencesChange,
  onDataChange,
  onContentChange,
}: PageLayoutMasterProps) {
  const { id: containerId } = useContainer();

  return containerId === 0 ? (
    <Paper>
      <div id={id}>
        <Editor id={id} onContentChange={onContentChange} />
      </div>
    </Paper>
  ) : (
    <PageLayoutSelector
      id={id}
      onReferencesChange={onReferencesChange}
      onDataChange={onDataChange}
    />
  );
}
