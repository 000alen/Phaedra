import "quill/dist/quill.bubble.css";

import React from "react";

import { UseContentInjectedProps } from "../UseContent/UseContent";
import { Editor } from "./Editor";

export type ContentSkeletonProps = UseContentInjectedProps;

export const ContentSkeleton = React.memo(
  ({
    _contentManager,
    _defaultContent,
    _onContentChange,
    _modules,
    _formats,
    _autoformat,
    _readOnly,
    _spellCheck,
    _id,
    _notebookManager,
    _page
  }: ContentSkeletonProps) => {
    return (
      <Editor
        defaultContent={_defaultContent}
        onContentChange={_onContentChange}
        modules={_modules}
        formats={_formats}
        autoformat={_autoformat}
        readOnly={_readOnly}
        spellCheck={_spellCheck}
        id={_id}
        notebookManager={_notebookManager}
        page={_page}
      />
    );
  }
);
