import React from "react";

import { Label, Spinner, SpinnerSize } from "@fluentui/react";

import { question } from "../../core/Language";
import { BlotsProps, BlotsState } from "./types";

export class QuestionComponent extends React.Component<BlotsProps, BlotsState> {
  constructor(props: BlotsProps) {
    super(props);

    const { data } = props;

    const query = typeof data === "string" ? data : data.query;
    const response = typeof data === "string" ? null : data.response;

    this.state = {
      query,
      response
    };
  }

  componentDidMount() {
    const { notebookManager, page } = this.props;
    const { query, response } = this.state;

    if (response !== null) return;

    question(
      page.references.length > 0
        ? notebookManager.getSource(page.references[0].sourceId)!.content
        : "",
      query
    )
      .then((response) => {
        this.setState({ response });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  getData() {
    const { query, response } = this.state;
    return response === null ? query : { query, response };
  }

  render() {
    const { query, response } = this.state;

    return response === null ? (
      <div className="flex flex-row space-x-2 align-middle">
        <Spinner size={SpinnerSize.xSmall} />
        <Label>{query}</Label>
      </div>
    ) : (
      <div>
        <Label>{query}</Label>
        <pre>{response}</pre>
      </div>
    );
  }
}
