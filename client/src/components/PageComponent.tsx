import React, { Component } from "react";

import { NotebookController } from "../contexts/NotebookController";
import { IBlock, IData, IReference } from "../structures/NotebookStructure";
import { DocumentSourceComponent } from "./DocumentSourceComponent";
import PaperComponent from "./PaperComponent";
import SplitViewComponent from "./SplitView/SplitViewComponent";

export interface PageComponentProps {
  id: string;
  references: IReference[];
  data: IData;
  blocks: IBlock[];
  onBlocks: (pageId: string, blocks: IBlock[]) => void;
}

export interface PageComponentState {}

export default class PageComponent extends Component<
  PageComponentProps,
  PageComponentState
> {
  static contextType = NotebookController;

  render() {
    const { id, blocks, onBlocks } = this.props;

    return (
      <div>
        <SplitViewComponent
          left={
            <div className="flex justify-center">
              <PaperComponent id={id} blocks={blocks} onBlocks={onBlocks} />
            </div>
          }
          right={
            <div className="flex justify-center">
              <DocumentSourceComponent />
            </div>
          }
        />
      </div>
    );
  }
}
