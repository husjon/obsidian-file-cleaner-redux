import { moment } from "obsidian";
import enUS from "./locales/en";
import zhCN from "./locales/zh-cn";
import type { Locale } from "./locales/locale";

interface LOCALE {
  [locale: string]: Locale;
}
const LOCALES: LOCALE = {
  en: enUS,
  "zh-cn": zhCN,
};

export default function translate() {
  const systemLocale = moment.locale();

  const locale = LOCALES[systemLocale];

  if (locale !== undefined) return locale;
  else return LOCALES["en"];
}
