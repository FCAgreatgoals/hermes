// Regex patterns
export const FORMAT_EXPRESSION_REGEX = /^(\w+)(?::(\w+)\((.+)\))?$/;
export const SWITCH_FORMATTER_REGEX = /(-inf|\d+!?)-(\d+!?|inf)/;
export const FULL_YEAR_REGEX = /\bYYYY\b/;
export const YEAR_REGEX = /\bYY\b/;
export const MONTH_REGEX = /\bMM\b/;
export const DAY_REGEX = /\bDD\b/;
export const HOUR_REGEX = /\bhh\b/;
export const MINUTE_REGEX = /\bmm\b/;
export const SECOND_REGEX = /\bss\b/;

// Path and file constants
export const DEFAULT_TRANSLATION_DIR = './.hermes';
export const DEFAULT_LOCALES_DIR = 'locales';
export const CONFIG_FILE_NAME = 'hermes.config.js';
export const TRANSLATIONS_FILE_NAME = 'translations.json';

// Key separators
export const PATH_SEPARATORS = {
    flat: '.',
    path: '/',
    namespaced: '/'
} as const;

export const NAMESPACE_SEPARATORS = {
    flat: '.',
    path: '/',
    namespaced: ':'
} as const;

export enum Langs {
    INDONESIAN = 'id',
    DANISH = 'da',
    GERMAN = 'de',
    ENGLISH_UK = 'en-GB',
    ENGLISH_US = 'en-US',
    SPANISH = 'es-ES',
    SPANISH_LATAM = 'es-419',
    FRENCH = 'fr',
    CROATIAN = 'hr',
    ITALIAN = 'it',
    LITHUANIAN = 'lt',
    HUNGARIAN = 'hu',
    DUTCH = 'nl',
    NORWEGIAN = 'no',
    POLISH = 'pl',
    BRAZILIAN_PORTUGUESE = 'pt-BR',
    ROMANIAN = 'ro',
    FINNISH = 'fi',
    SWEDISH = 'sv-SE',
    VIETNAMESE = 'vi',
    TURKISH = 'tr',
    CZECH = 'cs',
    GREEK = 'el',
    BULGARIAN = 'bg',
    RUSSIAN = 'ru',
    UKRAINIAN = 'uk',
    HINDI = 'hi',
    THAI = 'th',
    CHINESE_CHINA = 'zh-CN',
    JAPANESE = 'ja',
    CHINESE_TAIWAN = 'zh-TW',
    KOREAN = 'ko'
}

export const langToLocale: Record<Langs, string> = {
    [Langs.INDONESIAN]: 'id-ID',
    [Langs.DANISH]: 'da-DK',
    [Langs.GERMAN]: 'de-DE',
    [Langs.ENGLISH_UK]: 'en-GB',
    [Langs.ENGLISH_US]: 'en-US',
    [Langs.SPANISH]: 'es-ES',
    [Langs.SPANISH_LATAM]: 'es-419',
    [Langs.FRENCH]: 'fr-FR',
    [Langs.CROATIAN]: 'hr-HR',
    [Langs.ITALIAN]: 'it-IT',
    [Langs.LITHUANIAN]: 'lt-LT',
    [Langs.HUNGARIAN]: 'hu-HU',
    [Langs.DUTCH]: 'nl-NL',
    [Langs.NORWEGIAN]: 'nb-NO',
    [Langs.POLISH]: 'pl-PL',
    [Langs.BRAZILIAN_PORTUGUESE]: 'pt-BR',
    [Langs.ROMANIAN]: 'ro-RO',
    [Langs.FINNISH]: 'fi-FI',
    [Langs.SWEDISH]: 'sv-SE',
    [Langs.VIETNAMESE]: 'vi-VN',
    [Langs.TURKISH]: 'tr-TR',
    [Langs.CZECH]: 'cs-CZ',
    [Langs.GREEK]: 'el-GR',
    [Langs.BULGARIAN]: 'bg-BG',
    [Langs.RUSSIAN]: 'ru-RU',
    [Langs.UKRAINIAN]: 'uk-UA',
    [Langs.HINDI]: 'hi-IN',
    [Langs.THAI]: 'th-TH',
    [Langs.CHINESE_CHINA]: 'zh-CN',
    [Langs.JAPANESE]: 'ja-JP',
    [Langs.CHINESE_TAIWAN]: 'zh-TW',
    [Langs.KOREAN]: 'ko-KR'
}