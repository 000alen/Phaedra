import "phaedra-layout/dist/index.css";

import { LayoutSkeleton, UseLayout } from "phaedra-layout";
import React from "react";

import { NotebookController } from "../contexts";
import { IPage } from "../HOC/UseNotebook";
import { PageMasterPane } from "./PageMasterPane";

export interface PageProps {
  page: IPage;
}

export interface PageState {}

export class Page extends React.Component<PageProps, PageState> {
  static contextType = NotebookController;

  render() {
    const LayoutComponent = UseLayout(LayoutSkeleton);
    // @ts-ignore
    const layoutElement = <LayoutComponent Component={PageMasterPane} />;

    return <div className="w-[100%] h-[100%] relative">{layoutElement}</div>;
  }
}
