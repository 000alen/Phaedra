import { Content } from "../../phaedra-content/Content";
import React from "react";

import { Paper } from "../Paper";
import { IContent, IPage } from "../../HOC/UseNotebook/Notebook";
import { PagePaneSelector } from "./PagePaneSelector";
import { PaneRectProps } from "../../phaedra-layout/UseLayout/Rect";
import { Reference } from "../Reference";
import { NotebookManager } from "../../HOC/UseNotebook/UseNotebook";

interface PagePaneProps {
  id: string;
  page: IPage;
  notebookManager: NotebookManager;
  onContentChange: (content: IContent) => void;
  onQuillChange: (quillId: string, content: IContent) => void;
  addQuill: (callback?: (quillId: string) => void) => void;

  paneProps: PaneRectProps;
  setPaneType: (type: string) => void;
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
};

export function PagePane({
  id,
  page,
  notebookManager,
  onContentChange,
  onQuillChange,
  addQuill,
  paneProps,
  setPaneType,
}: PagePaneProps) {
  const { type, paramId } = paneProps;

  return type === "default" ? (
    <Paper>
      <Content
        defaultContent={page.content}
        autoformat={autoformat}
        onContentChange={onContentChange}
      />
    </Paper>
  ) : type === "new" ? (
    <PagePaneSelector setPaneType={setPaneType} />
  ) : type === "reference" ? (
    <Reference
      notebookManager={notebookManager}
      reference={{ id: "a", title: "a", sourceId: "a" }}
      // ! TODO
      // reference={notebookManager.getPageReference(id, paramId!)!}
    />
  ) : type === "quill" ? (
    <Paper>
      <Content
        defaultContent={notebookManager.getPageQuill(id, paramId!)?.content}
        autoformat={autoformat}
        onContentChange={(content) => onQuillChange(paramId!, content)}
      />
    </Paper>
  ) : (
    <></>
  );
}
