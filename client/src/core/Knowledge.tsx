import wiki from "wikijs";

export async function wsummary(query: string): Promise<string> {
  return (await wiki().page(query)).summary();
}

export async function wsuggestion(query: string): Promise<string[]> {
  return (await wiki().search(query)).results;
}

export async function wimage(query: string): Promise<string[]> {
  return (await wiki().page(query)).images();
}
