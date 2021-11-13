import Mousetrap from "mousetrap";
import React, { Component, MouseEvent } from "react";

import { INavLink, Nav } from "@fluentui/react";

import { AppController } from "../contexts/AppController";
import { strings } from "../resources/strings";
import { MainPageShortcuts } from "../shortcuts/MainPageShortcuts";
import { BackendView } from "../views/BackendView";
import { EmptyView } from "../views/EmptyView";
import { FromPdfView } from "../views/FromPdfView";
import { FromTextView } from "../views/FromTextView";
import { NotebookView } from "../views/NotebookView";
import { PinnedView } from "../views/PinnedView";
import { RecentView } from "../views/RecentView";

export interface MainPageProps {
  id: string;
}

export interface MainPageState {
  selectedKey: string;
  navLinkContents: any;
}

export interface MainPageViewProps {
  id: string;
}

const navLinkGroups = [
  {
    name: strings.navigationHomeGroupTitle,
    links: [
      { name: strings.navigationRecentItemTitle, key: "recent", url: "#" },
      { name: strings.navigationPinnedItemTitle, key: "pinned", url: "#" },
    ],
  },
  {
    name: strings.navigationNewGroupTitle,
    links: [
      { name: strings.navigationEmptyItemTitle, key: "empty", url: "#" },
      { name: strings.navigationFromPdfItemTitle, key: "from_pdf", url: "#" },
      { name: strings.navigationFromTextItemTitle, key: "from_text", url: "#" },
    ],
  },
  {
    name: strings.navigationOpenGroupTitle,
    links: [
      { name: strings.navigationNotebookItemTitle, key: "notebook", url: "#" },
    ],
  },
  {
    name: strings.navigationSettingsGroupTitle,
    links: [
      { name: strings.navigationBackendItemTitle, key: "backend", url: "#" },
    ],
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
      Mousetrap.bind(
        keys,
        (event) => {
          action(this.context);
          event.preventDefault();
        },
        "keyup"
      );
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
      <div className="w-[100%] h-[100%] flex flex-row">
        <div className="h-[100%] w-60">
          <Nav
            groups={navLinkGroups}
            onLinkClick={this.handleClick}
            selectedKey={selectedKey}
          />
        </div>

        <div className="w-[100%] h-[100%]">{navLinkContents[selectedKey]}</div>
      </div>
    );
  }
}
