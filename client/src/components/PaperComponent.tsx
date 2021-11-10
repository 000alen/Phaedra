import React, { Component } from "react";
import * as Y from "yjs";

import { theme } from "../resources/theme";
import { IBlock } from "../structures/NotebookStructure";
import { EditorBinding } from "../y-editor/y-editor";
import Editor from "./Editor";

interface PaperComponentProps {
  id: string;
  blocks: IBlock[];
  onBlocks: (pageId: string, blocks: IBlock[]) => void;
  addEditorBinding: (binding: EditorBinding) => void;
  yDoc: Y.Doc;
}

interface PaperComponentState {}

export default class PaperComponent extends Component<
  PaperComponentProps,
  PaperComponentState
> {
  render() {
    const { id, blocks, onBlocks, addEditorBinding, yDoc } = this.props;

    const pageStyle = {
      width: "8.5in",
      minHeight: "11in",
      backgroundColor: theme.palette.white,
    };

    return (
      <div className="px-2 py-10 m-2 rounded-sm shadow-sm" style={pageStyle}>
        <Editor
          id={id}
          blocks={blocks}
          onBlocks={onBlocks}
          addEditorBinding={addEditorBinding}
          yDoc={yDoc}
        />
      </div>
    );
  }
}
