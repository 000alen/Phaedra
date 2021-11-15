import "react-quill/dist/quill.bubble.css";

import React from "react";
import ReactQuill from "react-quill";

interface EditorProps {
  id: string;
  onContentChange: (...args: any[]) => void;
}

export function Editor({ id }: EditorProps) {
  return <ReactQuill theme="bubble" defaultValue="Hello, world!" />;
}
