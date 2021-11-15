import { useState } from "react";

import { IMessage } from "../App";

export function useMessages(initialMessages: IMessage[]) {
  const [messages, setMessages] = useState(initialMessages);

  return {
    messages,
    messagesManager: new MessagesManager(messages, setMessages),
  };
}

export class MessagesManager {
  messages: IMessage[];
  setMessages: (messages: IMessage[]) => void;

  constructor(
    messages: IMessage[],
    setMessages: (messages: IMessage[]) => void
  ) {
    this.messages = messages;
    this.setMessages = setMessages;
  }

  get(id: string) {}

  add(message: IMessage) {}

  remove(id: string) {}
}
