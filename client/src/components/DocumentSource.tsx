import React from "react";

import { mergeStyles, Shimmer } from "@fluentui/react";

import { Paper } from "./Paper";

export interface DocumentSourceProps {
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

export function DocumentSource({ pageNumber }: DocumentSourceProps) {
  return (
    <Paper>
      <div className={`w-[100%] h-[100%] ${wrapperClass}`}>
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
    </Paper>
  );
}
