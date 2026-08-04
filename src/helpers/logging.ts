import { getSettings } from "./helpers";

export function logMsg(msg: string) {
  const settings = getSettings();

  if (settings.debugLogging) console.log(msg);
}

export function logGroupStart(name?: string) {
  const settings = getSettings();

  if (settings.debugLogging) console.group(name);
}

export function logGroupEnd() {
  const settings = getSettings();

  if (settings.debugLogging) console.groupEnd();
}
