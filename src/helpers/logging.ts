import { getSettings } from "./helpers";

export function logMsg(msg: string) {
  const settings = getSettings();

  // eslint-disable-next-line eslint-comments/no-restricted-disable -- disabling due to message below
  // eslint-disable-next-line obsidianmd/rule-custom-message -- console logs are gated behind an option
  if (settings.debugLogging) console.log(msg);
}

export function logGroupStart(name?: string) {
  const settings = getSettings();

  // eslint-disable-next-line eslint-comments/no-restricted-disable -- disabling due to message below
  // eslint-disable-next-line obsidianmd/rule-custom-message -- console logs are gated behind an option
  if (settings.debugLogging) console.group(name);
}

export function logGroupEnd() {
  const settings = getSettings();

  // eslint-disable-next-line eslint-comments/no-restricted-disable -- disabling due to message below
  // eslint-disable-next-line obsidianmd/rule-custom-message -- console logs are gated behind an option
  if (settings.debugLogging) console.groupEnd();
}
