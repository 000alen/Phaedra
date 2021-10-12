import React, { useState } from "react";
import { Nav } from "@fluentui/react";
import BackendView from "./views/BackendView";
import FromPdfView from "./views/FromPdfView";
import FromTextView from "./views/FromTextView";
import NotebookView from "./views/NotebookView";
import PinnedView from "./views/PinnedView";
import RecentView from "./views/RecentView";
import EmptyView from "./views/EmptyView";

import "../../css/pages/MainPage.css";

const navLinkGroups = [
  {
    name: "Home",
    links: [
      { name: "Recent", key: "recent" },
      { name: "Pinned", key: "pinned" },
    ],
  },
  {
    name: "New",
    links: [
      { name: "Empty", key: "empty" },
      { name: "From PDF", key: "from_pdf" },
      { name: "From text", key: "from_text" },
    ],
  },
  {
    name: "Open",
    links: [{ name: "Notebook", key: "notebook" }],
  },
  {
    name: "Settings",
    links: [{ name: "Connect to a backend", key: "backend" }],
  },
];

export default function MainPage({ id, appController, statusBarRef }) {
  const [selectedKey, setSelectedKey] = useState("backend");

  const navLinkContents = {
    recent: (
      <RecentView
        id={id}
        appController={appController}
        statusBarRef={statusBarRef}
      />
    ),
    pinned: (
      <PinnedView
        id={id}
        appController={appController}
        statusBarRef={statusBarRef}
      />
    ),
    empty: (
      <EmptyView
        id={id}
        appController={appController}
        statusBarRef={statusBarRef}
      />
    ),
    from_pdf: (
      <FromPdfView
        id={id}
        appController={appController}
        statusBarRef={statusBarRef}
      />
    ),
    from_text: (
      <FromTextView
        id={id}
        appController={appController}
        statusBarRef={statusBarRef}
      />
    ),
    notebook: (
      <NotebookView
        id={id}
        appController={appController}
        statusBarRef={statusBarRef}
      />
    ),
    backend: (
      <BackendView
        id={id}
        appController={appController}
        statusBarRef={statusBarRef}
      />
    ),
  };

  return (
    <div className="mainPage">
      <div className="mainPageSideBar">
        <Nav
          ariaLabel="Nav example with custom group headers"
          groups={navLinkGroups}
          onLinkClick={(e, item) => setSelectedKey(item.key)}
          selectedKey={selectedKey}
        />
      </div>

      <div className="mainPageContent">{navLinkContents[selectedKey]}</div>
    </div>
  );
}
