import { v4 as uuidv4 } from "uuid";

import { strings } from "../../strings";
import { ITab } from "./ITabsManipulation";

export function createTab({ id, title, content }: Partial<ITab>): ITab {
  if (id === undefined) id = uuidv4();
  if (title === undefined) title = strings.newTabTitle;
  if (content === undefined) content = undefined;

  return {
    id: id,
    title: title,
    content: content,
  };
}
