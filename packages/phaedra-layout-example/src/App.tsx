import { Layout } from "phaedra-layout";
import { IDirection, ILayout, ILayoutController } from "phaedra-notebook";
import React from "react";

import { Item } from "./components/Item";

const defaultLayout = {
  type: "layout",
  orientation: "horizontal",
  position: 0,
  size: 1,
  children: [
    {
      type: "pane",
      position: 0,
      size: 0.5,
      props: {
        type: "default"
      }
    },
    {
      type: "layout",
      position: 0.5,
      size: 0.5,
      orientation: "vertical",
      children: [
        {
          type: "pane",
          position: 0,
          size: 0.5,
          props: {
            type: "default"
          }
        },
        {
          type: "pane",
          position: 0.5,
          size: 0.5,
          props: {
            type: "default"
          }
        }
      ]
    }
  ]
} as ILayout;

function App() {
  const [layout] = React.useState<ILayout>(defaultLayout);

  const layoutController: ILayoutController = {
    splitPageLayoutPane: (
      pageId: string,
      paneId: string,
      edge: IDirection,
      size: number
    ) => {
      console.log("splitPageLayoutPane", pageId, paneId, edge, size);
    },
    resizePageLayoutPane: (
      pageId: string,
      paneId: string,
      edge: IDirection,
      size: number
    ) => {
      console.log("resizePageLayoutPane", pageId, paneId, edge, size);
    },
    removePageLayoutPane: (pageId: string, paneId: string) => {
      console.log("removePageLayoutPane", pageId, paneId);
    }
  };

  const style = {
    width: "48vw",
    height: "27vh"
  } as React.CSSProperties;

  return (
    <div style={style}>
      <Layout
        notebook={layoutController}
        pageId="page"
        layout={layout}
        orientation="horizontal"
        Component={Item}
      />
    </div>
  );
}

export default App;
