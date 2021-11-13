import React, { Component } from "react";

import EditorJS, { API, BlockAPI, OutputData } from "@editorjs/editorjs";

import { tools } from "../resources/tools";
import { IBlock } from "../structures/NotebookStructure";

interface EditorProps {
  id: string;
  blocks: IBlock[];
}

interface EditorState {
  editor: EditorJS | undefined;
  data: OutputData;
  id: string;
}

function wrapBlocks(blocks: IBlock[]): OutputData {
  return {
    time: new Date().getTime(),
    blocks: blocks,
  };
}

export class Editor extends Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    this.onChange = this.onChange.bind(this);

    const { id, blocks } = props;

    this.state = {
      editor: undefined,
      data: wrapBlocks(blocks),
      id: id,
    };
  }

  componentDidMount() {
    const { editor } = this.state;

    if (editor === undefined) this.initEditor();
  }

  componentWillUnmount() {
    const { editor } = this.state;

    if (editor !== undefined) editor!.destroy();
  }

  initEditor() {
    const { data, id } = this.state;

    const editor = new EditorJS({
      holder: id,
      data: data,
      onReady: () => {
        this.setState((state) => ({ ...state, editor: editor }));
      },
      onChange: this.onChange,
      tools: tools,
    });
  }

  async onChange(api: API, block: BlockAPI) {
    const data = await api.saver.save();

    this.setState((state) => ({ ...state, data: data }));
  }

  render() {
    const { id } = this.state;

    return <div id={id}></div>;
  }
}
