import { MessageBarType } from "@fluentui/react";

export interface IMessage {
  id: string;
  text: string;
  type: MessageBarType;
}

export interface IMessagesCommand {
  message?: IMessage;
  id?: string;
}

export type IMessagesManipulation = (
  messages: IMessage[],
  args: Partial<IMessagesCommand>
) => IMessage[];
