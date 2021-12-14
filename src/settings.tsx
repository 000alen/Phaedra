import { getSettings as _getSettings } from "./electron";
import { ISettings } from "./types";

export function getSettings(): Promise<ISettings> {
  return _getSettings();
}
