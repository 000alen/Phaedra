import { ContentSkeleton, UseContent } from "phaedra-content";
import React from "react";

import { Paper } from "./Paper";

export function PagePane() {
  const ContentComponent = UseContent(ContentSkeleton);
  const contentElement = <ContentComponent />;

  return <Paper>{contentElement}</Paper>;
}
