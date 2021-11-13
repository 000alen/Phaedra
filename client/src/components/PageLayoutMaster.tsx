import React from "react";

import { useContainer } from "@pixore/subdivide";

import { IBlock } from "../structures/NotebookStructure";
import { Editor } from "./Editor";
import { PageLayoutSelector } from "./PageLayoutSelector";
import { Paper } from "./Paper";

interface PageLayoutMasterProps {
  id: string;
  blocks: IBlock[];
}

export function PageLayoutMaster({ id, blocks }: PageLayoutMasterProps) {
  const { id: containerId } = useContainer();

  return containerId === 0 ? (
    <Paper>
      <div id={id}>
        <Editor id={id} blocks={blocks} />
      </div>
    </Paper>
  ) : (
    <PageLayoutSelector id={id} />
  );
}
