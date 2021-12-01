import { Content } from "../phaedra-content/Content";
import React from "react";

import { Paper } from "./Paper";
import { Source } from "./Source";
import { IContent, IPage } from "../HOC/UseNotebook/UseNotebook";

interface PagePaneProps {
  id: string;
  page: IPage;
  onContentChange: (content: IContent) => void;
}

const autoformat = {
  generation: {
    trigger: /[\s.,;:!?]/,
    find: /\/\"[\w\ ,.:;!?]+\"/i,
    extract: /\/\"([\w\ ,.:;!?]+)\"/i,
    transform: "$1",
    insert: "generation",
  },
  mention: {
    trigger: /[\s.,;:!?]/,
    find: /@\"[\w\ ,.:;!?]+\"/i,
    extract: /@\"([\w\ ,.:;!?]+)\"/i,
    transform: "$1",
    insert: "mention",
  },
  question: {
    trigger: /[\s.,;:!?]/,
    find: /\?\"[\w\ ,.:;!?]+\"/i,
    extract: /\?\"([\w\ ,.:;!?]+)\"/i,
    transform: "$1",
    insert: "question",
  },
};

export function PagePane({ id, page, onContentChange }: PagePaneProps) {
  const [index, setIndex] = React.useState(0);

  const incrementIndex = () => {
    setIndex(index + 1);
  };

  const carousel = [
    <Content
      defaultContent={page.content}
      autoformat={autoformat}
      onContentChange={onContentChange}
    />,
    <Source />,
  ];

  return (
    <>
      <div
        className="absolute left-0 top-5 w-10 h-10 bg-red-600 opacity-30 rounded-r-3xl z-50"
        onClick={incrementIndex}
      ></div>
      <Paper>{carousel[index % carousel.length]}</Paper>
    </>
  );
}
