import React, { Component } from "react";
import Split from "react-split";

import { NotebookController } from "../contexts/NotebookController";
import { IBlock, IData, IReference } from "../structures/NotebookStructure";
import { DocumentSourceComponent } from "./DocumentSourceComponent";
import PaperComponent from "./PaperComponent";

export interface PageComponentProps {
  id: string;
  references: IReference[];
  data: IData;
  blocks: IBlock[];
  onBlocks: (pageId: string, blocks: IBlock[]) => void;
}

const showThreshold = 1;

export interface PageComponentState {
  sizes: number[] | undefined;
}

export default class PageComponent extends Component<
  PageComponentProps,
  PageComponentState
> {
  static contextType = NotebookController;

  constructor(props: PageComponentProps) {
    super(props);

    this.setSizes = this.setSizes.bind(this);

    this.state = {
      sizes: undefined,
    };
  }

  setSizes(sizes: number[]) {
    this.setState((state) => {
      return {
        ...state,
        sizes: sizes,
      };
    });
  }

  render() {
    const { id, blocks, onBlocks } = this.props;
    const { sizes } = this.state;

    const sourceElement = (
      <div className="flex justify-center">
        <DocumentSourceComponent />
      </div>
    );

    return (
      <div className="fill-parent">
        <Split className="flex flex-row" minSize={0} onDragEnd={this.setSizes}>
          <div className="flex justify-center">
            <PaperComponent id={id} blocks={blocks} onBlocks={onBlocks} />
          </div>

          {sizes !== undefined ? (
            sizes[sizes.length - 1] > showThreshold ? (
              sourceElement
            ) : (
              <div />
            )
          ) : (
            sourceElement
          )}
        </Split>
      </div>
    );
  }
}
