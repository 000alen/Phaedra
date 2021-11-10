import React, { Component } from "react";
import Split from "react-split";
import * as Y from "yjs";

import { NotebookController } from "../contexts/NotebookController";
import { IBlock, IData, IReference } from "../structures/NotebookStructure";
import { EditorBinding } from "../y-editor/y-editor";
import { DocumentSourceComponent } from "./DocumentSourceComponent";
import Editor from "./Editor";
import PaperContainerComponent from "./PaperContainerComponent";

export interface PageComponentProps {
  id: string;
  references: IReference[];
  data: IData;
  blocks: IBlock[];
  onBlocks: (pageId: string, blocks: IBlock[]) => void;
  addEditorBinding: (binding: EditorBinding) => void;
  yDoc: Y.Doc;
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
    const { id, blocks, onBlocks, addEditorBinding, yDoc } = this.props;
    const { sizes } = this.state;

    const sourceElement = <DocumentSourceComponent />;

    return (
      <div className="fill-parent">
        <Split
          className="fill-parent flex flex-row"
          minSize={0}
          onDragEnd={this.setSizes}
        >
          <PaperContainerComponent>
            <Editor
              id={id}
              blocks={blocks}
              onBlocks={onBlocks}
              addEditorBinding={addEditorBinding}
              yDoc={yDoc}
            />
          </PaperContainerComponent>

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
