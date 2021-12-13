import { en } from "./en";
import { es } from "./es";
import { Locale } from "./types";

const locales = {
  en,
  es,
};

export function getStrings(): Locale {
  return locales.en;
}
