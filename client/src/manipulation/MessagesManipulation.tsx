import { v4 as uuidv4 } from "uuid";

import { MessageBar, MessageBarType } from "@fluentui/react";

import { strings } from "../strings";
import { IMessage, IMessagesCommand } from "./IMessagesManipulation";

export function createMessage({ id, text, type }: Partial<IMessage>): IMessage {
  if (!id) id = uuidv4();
  if (!text) text = strings.newMessageTitle;
  if (!type) type = MessageBarType.info;

  return { id: id, text: text, type: type };
}

export function addMessage(
  messages: IMessage[],
  { message }: IMessagesCommand
): IMessage[] {
  return [...messages, message!];
}

export function removeMessage(
  messages: IMessage[],
  { id }: IMessagesCommand
): IMessage[] {
  return messages.filter((message) => message.id !== id);
}
