import { v4 as uuidv4 } from "uuid";

import { MessageBarType } from "@fluentui/react";

import { strings } from "../../strings";
import { IMessage } from "./IMessagesManipulation";

export function createMessage({ id, text, type }: Partial<IMessage>): IMessage {
  if (!id) id = uuidv4();
  if (!text) text = strings.newMessageTitle;
  if (!type) type = MessageBarType.info;

  return { id: id, text: text, type: type };
}
