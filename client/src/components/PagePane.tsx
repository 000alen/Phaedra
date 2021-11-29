import { Content } from "phaedra-content";
import React from "react";

import { IPage } from "../HOC/UseNotebook";
import { Paper } from "./Paper";

interface PagePaneProps {
  page: IPage;
}

export function PagePane({}: PagePaneProps) {
  return (
    <>
      <Paper>
        <Content />
      </Paper>
    </>
  );
}
