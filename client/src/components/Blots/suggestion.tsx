import { Label, Spinner, SpinnerSize } from "@fluentui/react";
import React from "react";
import { wsuggestion } from "../../core/Knowledge";
import { BlotsProps, BlotsState } from "./types";

export class SuggestionComponent extends React.Component<
  BlotsProps,
  BlotsState
> {
  constructor(props: BlotsProps) {
    super(props);

    const { data } = props;

    const query = typeof data === "string" ? data : data.query;
    const response = typeof data === "string" ? null : data.response;

    this.state = {
      query,
      response,
    };
  }

  componentDidMount() {
    const { query, response } = this.state;

    if (response !== null) return;

    wsuggestion(query)
      .then((response) => {
        this.setState({ response });
      })
      .catch((error) => {});
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
        {response.map((suggestion: string) => (
          <Label>{suggestion}</Label>
        ))}

        {/* {Object.entries(response).map(([key, value]) => (
          <a href={value as string}>{key}</a>
        ))} */}
      </div>
    );
  }
}
