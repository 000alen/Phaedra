import "react-quill/dist/quill.bubble.css";

import React from "react";
import ReactQuill from "react-quill";

interface EditorProps {
  // id: string;
  // onContentChange: (...args: any[]) => void;
}

export function Editor({}: EditorProps) {
  return <ReactQuill theme="bubble" defaultValue="Hello, world!" />;
}
