import { IMessage, IMessagesCommand } from "./IMessagesManipulation";

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
