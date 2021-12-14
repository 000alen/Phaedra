import { Content } from "../../Content/Content";
import React from "react";

import { Paper } from "../Paper";
import { IContent, IPage } from "../../Notebook/types";
import { PagePaneSelector } from "./PagePaneSelector";
import { PaneRectProps } from "../../Layout/UseLayout/Rect";
import { Reference } from "./Reference";
import { NotebookManager } from "../../Notebook/UseNotebook";

interface PagePaneProps {
  id: string;
  page: IPage;
  notebookManager: NotebookManager;
  onContentChange: (content: IContent) => void;
  onQuillChange: (quillId: string, content: IContent) => void;
  addReference: (
    sourceId: string,
    callback?: (referenceId: string) => void
  ) => void;
  addQuill: (callback?: (quillId: string) => void) => void;

  paneProps: PaneRectProps;
  setPaneProps: (type: PaneRectProps) => void;
}

const autoformat = {
  generation: {
    trigger: /[\s.,;:!?]/,
    find: /\/"[\w ,.:;!?]+"/i,
    extract: /\/"([\w ,.:;!?]+)"/i,
    transform: "$1",
    insert: "generation",
  },
  mention: {
    trigger: /[\s.,;:!?]/,
    find: /@"[\w ,.:;!?]+"/i,
    extract: /@"([\w ,.:;!?]+)"/i,
    transform: "$1",
    insert: "mention",
  },
  question: {
    trigger: /[\s.,;:!?]/,
    find: /\?"[\w ,.:;!?]+"/i,
    extract: /\?"([\w ,.:;!?]+)"/i,
    transform: "$1",
    insert: "question",
  },
  wimage: {
    trigger: /[\s.,;:!?]/,
    find: /image"[\w ,.:;!?]+"/i,
    extract: /image"([\w ,.:;!?]+)"/i,
    transform: "$1",
    insert: "wimage",
  },
  wsuggestion: {
    trigger: /[\s.,;:!?]/,
    find: /suggestion"[\w ,.:;!?]+"/i,
    extract: /suggestion"([\w ,.:;!?]+)"/i,
    transform: "$1",
    insert: "wsuggestion",
  },
  wsummary: {
    trigger: /[\s.,;:!?]/,
    find: /summary"[\w ,.:;!?]+"/i,
    extract: /summary"([\w ,.:;!?]+)"/i,
    transform: "$1",
    insert: "wsummary",
  },
};

export function PagePane({
  id,
  page,
  notebookManager,
  onContentChange,
  onQuillChange,
  addReference,
  addQuill,
  paneProps,
  setPaneProps,
}: PagePaneProps) {
  const { type, paramId } = paneProps;

  return type === "default" ? (
    <Paper>
      <Content
        id={id}
        notebookManager={notebookManager}
        page={page}
        defaultContent={page.content}
        autoformat={autoformat}
        onContentChange={onContentChange}
      />
    </Paper>
  ) : type === "new" ? (
    <PagePaneSelector
      id={id}
      page={page}
      notebookManager={notebookManager}
      addReference={addReference}
      addQuill={addQuill}
      setPaneProps={setPaneProps}
    />
  ) : type === "reference" ? (
    <Reference
      notebookManager={notebookManager}
      reference={notebookManager.getPageReference(id, paramId!)!}
    />
  ) : type === "quill" ? (
    <Paper>
      <Content
        id={id}
        notebookManager={notebookManager}
        page={page}
        defaultContent={notebookManager.getPageQuill(id, paramId!)?.content!}
        autoformat={autoformat}
        onContentChange={(content) => onQuillChange(paramId!, content)}
      />
    </Paper>
  ) : (
    <div className="w-full h-full"></div>
  );
}
