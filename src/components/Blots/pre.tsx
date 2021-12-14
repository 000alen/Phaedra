import React from "react";
import { BlotsProps, BlotsState } from "./types";

export class PreComponent extends React.Component<BlotsProps, BlotsState> {
  getData() {
    const { data } = this.props;
    return data;
  }

  render() {
    const { data } = this.props;

    return <pre>{data}</pre>;
  }
}
