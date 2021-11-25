import "react-quill/dist/quill.bubble.css";
import "phaedra-layout/dist/index.css";

import { LayoutSkeleton, UseLayout } from "phaedra-layout";
import React from "react";

import { NotebookController } from "../contexts";
import { IContent, IData, IReference } from "../HOC/UseNotebook";
import { PagePaneSelector } from "./PagePaneSelector";

export interface PageProps {
  id: string;
  references: IReference[];
  data: IData;
  content: IContent;
  layout: any;
  onReferencesChange: (...args: any[]) => void;
  onDataChange: (...args: any[]) => void;
  onContentChange: (...args: any[]) => void;
  onLayoutChange: (...args: any[]) => void;
}

export interface PageState {}

export class Page extends React.Component<PageProps, PageState> {
  static contextType = NotebookController;

  render() {
    const LayoutComponent = UseLayout(LayoutSkeleton);
    // @ts-ignore
    const layoutElement = <LayoutComponent Component={PagePaneSelector} />;

    return <div className="w-[100%] h-[100%] relative">{layoutElement}</div>;
  }
}
