import { IconButton, Label, Spinner, SpinnerSize } from "@fluentui/react";
import React from "react";
import { wimage } from "../../API/PhaedraAPI";
import { BlotsProps, BlotsState } from "./types";

export class ImageComponent extends React.Component<
  BlotsProps,
  BlotsState & { index: number }
> {
  constructor(props: BlotsProps) {
    super(props);

    this.increaseIndex = this.increaseIndex.bind(this);
    this.decreaseIndex = this.decreaseIndex.bind(this);

    const { data } = props;

    const query = typeof data === "string" ? data : data.query;
    const response = typeof data === "string" ? null : data.response;
    const index = typeof data === "string" ? 0 : data.index;

    this.state = {
      query,
      response,
      index,
    };
  }

  componentDidMount() {
    const { query, response } = this.state;

    if (response !== null) return;

    wimage(query)
      .then((response) => {
        this.setState({ response });
      })
      .catch((error) => {});
  }

  getData() {
    const { query, response, index } = this.state;
    return response === null ? query : { query, response, index };
  }

  increaseIndex() {
    this.setState(({ index }) => ({ index: index + 1 }));
  }

  decreaseIndex() {
    this.setState(({ index }) => ({ index: index > 0 ? index - 1 : index }));
  }

  render() {
    const { query, response, index } = this.state;

    return !response ? (
      <div className="flex flex-row space-x-2 align-middle">
        <Spinner size={SpinnerSize.xSmall} />
        <Label>{query}</Label>
      </div>
    ) : (
      <div className="relative">
        <img
          className="rounded"
          src={response[index % response.length]}
          alt={query}
        />
        <div className="absolute right-0 bottom-0">
          <IconButton
            iconProps={{ iconName: "ChromeBack" }}
            onClick={this.decreaseIndex}
          />
          <IconButton
            iconProps={{ iconName: "ChromeBackMirrored" }}
            onClick={this.increaseIndex}
          />
        </div>
      </div>
    );
  }
}
