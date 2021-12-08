import { INotebook } from "../Notebook/Notebook";
import { empty } from "../Notebook/UseNotebook";

export async function notebookFromPdf(
  path: string,
  base64: string
): Promise<INotebook> {
  return await empty();
}
