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
    const { page } = this.props;

    const LayoutComponent = UseLayout(LayoutSkeleton);
    const layoutElement = (
      // @ts-ignore
      <LayoutComponent Component={PageMasterPane} defaultLayout={page.layout} />
    );

    return <div className="w-[100%] h-[100%] relative">{layoutElement}</div>;
  }
}
