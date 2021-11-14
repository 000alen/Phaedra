import React from "react";

import { useContainer } from "@pixore/subdivide";

import { Editor } from "./Editor";
import { PageLayoutSelector } from "./PageLayoutSelector";
import { Paper } from "./Paper";

interface PageLayoutMasterProps {
  id: string;
}

export function PageLayoutMaster({ id }: PageLayoutMasterProps) {
  const { id: containerId } = useContainer();

  return containerId === 0 ? (
    <Paper>
      <div id={id}>
        <Editor id={id} />
      </div>
    </Paper>
  ) : (
    <PageLayoutSelector id={id} />
  );
}
