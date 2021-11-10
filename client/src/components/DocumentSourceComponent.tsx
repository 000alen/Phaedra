import React from "react";

import { mergeStyles, Shimmer } from "@fluentui/react";

import PaperContainerComponent from "./PaperContainerComponent";

export interface DocumentSourceComponentProps {
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
  pageNumber,
}: DocumentSourceComponentProps) {
  return (
    <PaperContainerComponent className={`${wrapperClass}`}>
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
    </PaperContainerComponent>
  );
}
