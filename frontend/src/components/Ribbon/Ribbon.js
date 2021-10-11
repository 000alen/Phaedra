import React from "react";
import { Pivot, PivotItem } from "@fluentui/react";
import { theme } from "../../index";
import FileItems from "./items/FileItems";
import HomeItems from "./items/HomeItems";
import InsertItems from "./items/InsertItems";
import ReviewItems from "./items/ReviewItems";
import ViewItems from "./items/ViewItems";

import "../../css/Ribbon.css";
import EditItems from "./items/EditItems";

function Ribbon({ notebookRef, commandBoxRef, appController, pageController }) {
  const ribbonStyle = {
    backgroundColor: theme.palette.white,
  };

  return (
    <div className="ribbon" style={ribbonStyle}>
      <Pivot aria-label="Ribbon" defaultSelectedKey="home">
        <PivotItem headerText="File" itemKey="file">
          <FileItems
            notebookRef={notebookRef}
            commandBoxRef={commandBoxRef}
            appController={appController}
            pageController={pageController}
          />
        </PivotItem>

        <PivotItem headerText="Home" itemKey="home">
          <HomeItems
            notebookRef={notebookRef}
            commandBoxRef={commandBoxRef}
            appController={appController}
            pageController={pageController}
          />
        </PivotItem>

        <PivotItem headerText="Edit" itemKey="edit">
          <EditItems
            notebookRef={notebookRef}
            commandBoxRef={commandBoxRef}
            appController={appController}
            pageController={pageController}
          />
        </PivotItem>

        <PivotItem headerText="Insert" itemKey="insert">
          <InsertItems
            notebookRef={notebookRef}
            commandBoxRef={commandBoxRef}
            appController={appController}
            pageController={pageController}
          />
        </PivotItem>

        <PivotItem headerText="Review" itemKey="review">
          <ReviewItems
            notebookRef={notebookRef}
            commandBoxRef={commandBoxRef}
            appController={appController}
            pageController={pageController}
          />
        </PivotItem>

        <PivotItem headerText="View" itemKey="view">
          <ViewItems
            notebookRef={notebookRef}
            commandBoxRef={commandBoxRef}
            appController={appController}
            pageController={pageController}
          />
        </PivotItem>
      </Pivot>
    </div>
  );
}

export default Ribbon;
