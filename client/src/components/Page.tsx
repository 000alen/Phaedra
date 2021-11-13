import React, { Component } from "react";

import Subdivide, { ConfigProvider } from "@pixore/subdivide";

import { NotebookController } from "../contexts/NotebookController";
import { IBlock, IData, IReference } from "../structures/NotebookStructure";
import { PageLayoutMaster } from "./PageLayoutMaster";

export interface PageProps {
  id: string;
  references: IReference[];
  data: IData;
  blocks: IBlock[];
  onBlocks: (pageId: string, blocks: IBlock[]) => void;
  layout: any;
}

export interface PageState {}

export class Page extends Component<PageProps, PageState> {
  static contextType = NotebookController;

  constructor(props: PageProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { id, blocks, layout } = this.props;

    return (
      <div className="w-[100%] h-[100%] relative">
        <ConfigProvider initialState={layout}>
          <Subdivide
            component={() => <PageLayoutMaster id={id} blocks={blocks} />}
          />
        </ConfigProvider>
      </div>
    );
  }
}
