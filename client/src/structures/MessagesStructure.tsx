import { v4 as uuidv4 } from "uuid";

import { MessageBarType } from "@fluentui/react";

import { strings } from "../resources/strings";

export interface IMessage {
  id: string;
  text: string;
  type: MessageBarType;
}

export interface IMessagesManipulationArguments {
  message?: IMessage;
  id?: string;
}

export type IMessagesManipulation = (
  messages: IMessage[],
  args: Partial<IMessagesManipulationArguments>
) => IMessage[];

export function createMessage({ id, text, type }: Partial<IMessage>): IMessage {
  if (!id) id = uuidv4();
  if (!text) text = strings.newMessageTitle;
  if (!type) type = MessageBarType.info;

  return { id: id, text: text, type: type };
}

export function addMessage(
  messages: IMessage[],
  { message }: IMessagesManipulationArguments
): IMessage[] {
  return [...messages, message!];
}

export function removeMessage(
  messages: IMessage[],
  { id }: IMessagesManipulationArguments
): IMessage[] {
  return messages.filter((message) => message.id !== id);
}
