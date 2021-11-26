import { ContentSkeleton, UseContent } from "phaedra-content";
import React from "react";

import { Paper } from "./Paper";

export function PageMasterPane() {
  const ContentComponent = UseContent(ContentSkeleton);
  const contentElement = <ContentComponent />;

  return <Paper>{contentElement}</Paper>;
}
