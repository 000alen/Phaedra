import "../../css/pages/MainPage.css";

import Mousetrap from "mousetrap";
import React, { Component, MouseEvent } from "react";

import { INavLink, Nav } from "@fluentui/react";

import { AppController } from "../../contexts/AppController";
import { MainPageShortcuts } from "../../shortcuts/MainPageShortcuts";
import { MainPageProps, MainPageState } from "./IMainPage";
import BackendView from "./views/BackendView";
import EmptyView from "./views/EmptyView";
import FromPdfView from "./views/FromPdfView";
import FromTextView from "./views/FromTextView";
import NotebookView from "./views/NotebookView";
import PinnedView from "./views/PinnedView";
import RecentView from "./views/RecentView";

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

export class MainPage extends Component<MainPageProps, MainPageState> {
  static contextType = AppController;

  constructor(props: MainPageProps) {
    super(props);

    this.handleClick = this.handleClick.bind(this);

    const { id } = props;

    const navLinkContents = {
      recent: <RecentView id={id} />,
      pinned: <PinnedView id={id} />,
      empty: <EmptyView id={id} />,
      from_pdf: <FromPdfView id={id} />,
      from_text: <FromTextView id={id} />,
      notebook: <NotebookView id={id} />,
      backend: <BackendView id={id} />,
    };

    this.state = {
      selectedKey: "backend",
      navLinkContents: navLinkContents,
    };
  }

  handleClick(event?: MouseEvent<HTMLElement>, item?: INavLink): void {
    this.setState((state) => {
      return { ...state, selectedKey: item!.key! };
    });
  }

  componentDidMount(): void {
    for (const [keys, action] of Object.entries(MainPageShortcuts)) {
      Mousetrap.bind(keys, () => action(this.context), "keyup");
    }
  }

  componentWillUnmount(): void {
    for (const keys of Object.keys(MainPageShortcuts)) {
      Mousetrap.unbind(keys);
    }
  }

  render(): JSX.Element {
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