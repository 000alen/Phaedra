import React from "react";

import { mergeStyles, Shimmer } from "@fluentui/react";

import { theme } from "../resources/theme";

// import { DocumentFile } from "./NotebookComponent";

export interface DocumentSourceComponentProps {
  // document?: DocumentFile;
  pageNumber?: number;
}

const wrapperClass = mergeStyles({
  padding: 2,
  selectors: {
    "& > .ms-Shimmer-container": {
      margin: "10px 0",
    },
  },
});

export function DocumentSourceComponent({
  // document,
  pageNumber,
}: DocumentSourceComponentProps) {
  const pageStyle = {
    backgroundColor: theme.palette.white,
  };

  return (
    <div className="fill-parent p-2 m-2 rounded-sm shadow-sm" style={pageStyle}>
      <div className={`${wrapperClass}`}>
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
        <Shimmer />
      </div>
    </div>
  );
}
