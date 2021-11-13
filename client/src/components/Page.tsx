import React, { Component } from "react";

import Subdivide from "@pixore/subdivide";

import { NotebookController } from "../contexts/NotebookController";
import { IBlock, IData, IReference } from "../structures/NotebookStructure";
import { Editor } from "./Editor";
import { Paper } from "./Paper";

export interface PageProps {
  id: string;
  references: IReference[];
  data: IData;
  blocks: IBlock[];
  onBlocks: (pageId: string, blocks: IBlock[]) => void;
}

export interface PageState {
  sizes: number[] | undefined;
}

export class Page extends Component<PageProps, PageState> {
  static contextType = NotebookController;

  constructor(props: PageProps) {
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
    const { id, blocks } = this.props;

    return (
      <div className="w-[100%] h-[100%] relative">
        <Subdivide
          component={() => (
            <Paper>
              <Editor id={id} blocks={blocks} />
            </Paper>
          )}
        />
      </div>
    );
  }
}
