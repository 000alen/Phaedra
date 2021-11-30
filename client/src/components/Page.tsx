import "phaedra-layout/dist/index.css";

import { Layout } from "phaedra-layout";
import React from "react";

import { NotebookController } from "../contexts";
import { IPage } from "../HOC/UseNotebook/deprecated";
import { PagePane } from "./PagePane";

export interface PageProps {
  page: IPage;
}

export interface PageState {}

export class Page extends React.Component<PageProps, PageState> {
  static contextType = NotebookController;

  render() {
    const { page } = this.props;

    const layoutElement = (
      <Layout
        // @ts-ignore
        Component={PagePane}
        props={{
          page,
        }}
        defaultLayout={page.layout}
      />
    );

    return <div className="w-[100%] h-[100%] relative">{layoutElement}</div>;
  }
}
