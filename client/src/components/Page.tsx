import React, { Component } from "react";

import Subdivide, { ConfigProvider } from "@pixore/subdivide";

import { NotebookController } from "../contexts/NotebookController";
import { IContent, IData, IReference } from "../structures/NotebookStructure";
import { PageLayoutMaster } from "./PageLayoutMaster";

export interface PageProps {
  id: string;
  references: IReference[];
  data: IData;
  content: IContent;
  layout: any;
  onReferencesChange: Function;
  onDataChange: Function;
  onContentChange: Function;
  onLayoutChange: Function;
}

export interface PageState {}

export class Page extends Component<PageProps, PageState> {
  static contextType = NotebookController;

  render() {
    const { id, layout } = this.props;

    return (
      <div className="w-[100%] h-[100%] relative">
        <ConfigProvider initialState={layout}>
          <Subdivide component={() => <PageLayoutMaster id={id} />} />
        </ConfigProvider>
      </div>
    );
  }
}
