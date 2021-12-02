import { Content } from "../phaedra-content/Content";
import React from "react";

import { Paper } from "./Paper";
import { IContent, IPage } from "../HOC/UseNotebook/Notebook";

interface PagePaneProps {
  id: string;
  page: IPage;
  onContentChange: (content: IContent) => void;
  onQuillChange: (quillId: string, content: IContent) => void;
  addQuill: (callback?: (quillId: string) => void) => void;
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
  onContentChange,
  onQuillChange,
  addQuill,
}: PagePaneProps) {
  return (
    <Paper>
      <Content
        defaultContent={page.content}
        autoformat={autoformat}
        onContentChange={onContentChange}
      />
    </Paper>
  );
}
