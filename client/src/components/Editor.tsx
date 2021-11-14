import "react-quill/dist/quill.bubble.css";

import React, { Component } from "react";
import ReactQuill from "react-quill";

interface EditorProps {
  id: string;
}

interface EditorState {}

export class Editor extends Component<EditorProps, EditorState> {
  render() {
    return <ReactQuill theme="bubble" />;
  }
}
