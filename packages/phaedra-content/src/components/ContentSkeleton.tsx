import "quill/dist/quill.bubble.css";

import React from "react";
import { Editor } from "./Editor";
import { UseContentInjectedProps } from "../UseContent/UseContent";

export type ContentSkeleton = UseContentInjectedProps;

export const ContentSkeleton = React.memo(
  ({
    _contentManager,
    _defaultContent,
    _onContentChange,
    _modules,
    _formats,
    _autoformat,
    _readOnly,
    _spellCheck
  }: ContentSkeleton) => {
    return (
      <Editor
        defaultContent={_defaultContent}
        onContentChange={_onContentChange}
        modules={_modules}
        formats={_formats}
        autoformat={_autoformat}
        readOnly={_readOnly}
        spellCheck={_spellCheck}
      />
    );
  }
);
