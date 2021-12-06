import { Persona, PersonaSize } from "@fluentui/react";
import React from "react";
import { BlotsProps, BlotsState } from "./types";

export class MentionComponent extends React.Component<BlotsProps, BlotsState> {
  getData() {
    const { data } = this.props;
    return data;
  }

  render() {
    const { data } = this.props;

    return (
      <div>
        <Persona text={data} size={PersonaSize.size8} />
      </div>
    );
  }
}
