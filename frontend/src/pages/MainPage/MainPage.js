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
import mousetrap from "mousetrap";
import { MainPageShortcuts } from "./MainPageShortcuts";

const navLinkGroups = [
  {
    name: "Home",
    links: [
      { name: "Recent", key: "recent", url: "#" },
      { name: "Pinned", key: "pinned", url: "#" },
    ],
  },
  {
    name: "New",
    links: [
      { name: "Empty", key: "empty", url: "#" },
      { name: "From PDF", key: "from_pdf", url: "#" },
      { name: "From text", key: "from_text", url: "#" },
    ],
  },
  {
    name: "Open",
    links: [{ name: "Notebook", key: "notebook", url: "#" }],
  },
  {
    name: "Settings",
    links: [{ name: "Connect to a backend", key: "backend", url: "#" }],
  },
];

export class MainPage extends React.Component {
  constructor(props) {
    super(props);

    this.setSelectedKey = this.handleClick.bind(this);

    const { id, appController, statusBarRef } = props;

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

    this.state = {
      selectedKey: "backend",
      navLinkContents: navLinkContents,
    };
  }

  componentDidMount() {
    for (const shortcut of Object.entries(MainPageShortcuts)) {
      const [keys, callback] = shortcut;
      mousetrap.bind(
        keys,
        () => callback(this.state.pageController, this.state.appController),
        "keyup"
      );
    }
  }

  componentWillUnmount() {
    for (const shortcut of Object.entries(MainPageShortcuts)) {
      const [keys, callback] = shortcut;
      mousetrap.unbind(keys);
    }
  }

  handleClick(event, item) {
    this.setState((state) => {
      return { ...state, selectedKey: item.key };
    });
  }

  render() {
    const { selectedKey, navLinkContents } = this.state;

    return (
      <div className="mainPage">
        <div className="mainPageSideBar">
          <Nav
            ariaLabel="Nav example with custom group headers"
            groups={navLinkGroups}
            onLinkClick={this.handleClick}
            selectedKey={selectedKey}
          />
        </div>

        <div className="mainPageContent">{navLinkContents[selectedKey]}</div>
      </div>
    );
  }
}
