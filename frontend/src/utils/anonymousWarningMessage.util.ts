import { LOCALES } from "../i18n/locales";

const BUILT_IN_MESSAGE_KEY = "share.modal.anonymous-warning.description";

export const ANONYMOUS_WARNING_LANGUAGES = [
  {
    code: LOCALES.POLISH.code,
    name: LOCALES.POLISH.name,
    configKey: "share.anonymousWarningMessagePl",
    builtInMessage: LOCALES.POLISH.messages[BUILT_IN_MESSAGE_KEY],
  },
  {
    code: LOCALES.ENGLISH.code,
    name: LOCALES.ENGLISH.name,
    configKey: "share.anonymousWarningMessageEn",
    builtInMessage: LOCALES.ENGLISH.messages[BUILT_IN_MESSAGE_KEY],
  },
  {
    code: LOCALES.GERMAN.code,
    name: LOCALES.GERMAN.name,
    configKey: "share.anonymousWarningMessageDe",
    builtInMessage: LOCALES.GERMAN.messages[BUILT_IN_MESSAGE_KEY],
  },
  {
    code: LOCALES.FRENCH.code,
    name: LOCALES.FRENCH.name,
    configKey: "share.anonymousWarningMessageFr",
    builtInMessage: LOCALES.FRENCH.messages[BUILT_IN_MESSAGE_KEY],
  },
  {
    code: LOCALES.ITALIAN.code,
    name: LOCALES.ITALIAN.name,
    configKey: "share.anonymousWarningMessageIt",
    builtInMessage: LOCALES.ITALIAN.messages[BUILT_IN_MESSAGE_KEY],
  },
];

export const getAnonymousWarningConfigKeyForLocale = (
  locale: string,
): string | undefined => {
  return ANONYMOUS_WARNING_LANGUAGES.find((language) => language.code === locale)
    ?.configKey;
};
