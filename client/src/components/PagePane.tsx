import { Content } from "phaedra-content";
import React from "react";

import { IPage } from "../HOC/UseNotebook/deprecated";
import { Paper } from "./Paper";
import { Source } from "./Source";

interface PagePaneProps {
  page: IPage;
}

export function PagePane({ page }: PagePaneProps) {
  const [index, setIndex] = React.useState(0);

  const incrementIndex = () => {
    setIndex(index + 1);
  };

  const carousel = [
    // @ts-ignore
    <Content defaultContent={page.content} />,
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
