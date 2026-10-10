/**
 * This file is part of Hermes (https://github.com/FCAgreatgoals/hermes).
 *
 * Copyright (C) 2025 SAS French Community Agency
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import { readFileSync } from 'fs';

import { BuiltTranslations, LangsKeys, LocalizedObject, isBuiltTranslations } from '../types';
import { Langs, DEFAULT_TRANSLATION_DIR, TRANSLATIONS_FILE_NAME, langToLocale } from '../constants';
import LangData from './LangData';
import Context from './Context';
import { DEFAULT_CONFIG, loadConfig } from '../cli/HermesConfig';

/**
 * @typedef WarnStrategy
 * @description Defined strategies for checks
 * @version 'throw' - throw an error
 * @version 'warn' - log a warning
 * @version 'ignore' - ignore the issue
 */
export type WarnStrategy = 'throw' | 'warn' | 'ignore';

/**
 * @typedef HermesInitOptions
 * @description Options for the i18n system
 * @property {string} translationDir - Directory where translations are stored
 */
export type HermesInitOptions = Partial<{
    translationDir: string
    defaultLocale: Langs
}>;

export default class Hermes {

    private static instance: Hermes;
    private translations: Record<Langs, LangData> = {} as Record<Langs, LangData>;
    private defaultLocale: Langs;

    constructor(defaultLocale: Langs) {
        this.defaultLocale = defaultLocale;
    }

    /**
     * @method init
     * @description Initialize the i18n system
     *
     * @param options (optional) options for the i18n system
     */
    public static init() {
        if (Hermes.instance) throw new Error('I18n already initialized');

        const config = loadConfig()

        Hermes.instance = new Hermes(config.fallbackChains.default[0]);

        const built = JSON.parse(readFileSync(`${config.buildDir}/${TRANSLATIONS_FILE_NAME}`, 'utf-8'));

        Hermes.instance.translations = isBuiltTranslations(built) ? loadBuilt(built) : loadLegacy(built);

        if (Hermes.instance.defaultLocale && !Hermes.instance.translations[Hermes.instance.defaultLocale]) {
            throw new Error(`Default locale '${Hermes.instance.defaultLocale}' not found in translations`);
        }
    }

    /**
     * @method getContext
     * @description Get a context for a specific language
     *
     * @param lang language key (e.g. 'en-US', 'fr', etc...)
     * @param basePath (optional) base path for translations
     * @returns
     */
    public static getContext(lang: LangsKeys | 'default', basePath: string = '') {
        if (!Hermes.instance)
            throw new Error('I18n not initialized');

        if (lang === 'default') {
            lang = Hermes.instance.defaultLocale;
        }

        const langData = Hermes.instance.translations[lang] ?? Hermes.instance.translations[Hermes.instance.defaultLocale];

        return Context.create(langData, basePath);
    }

    /**
     * @method getLocalizedObject
     * @description Get a localized object for a specific key
     *
     * @param key
     * @returns LocalizedObject
     */
    public static getLocalizedObject(key: string): LocalizedObject {
        if (!Hermes.instance)
            throw new Error('I18n not initialized');

        const object: LocalizedObject = {};
        const langs = Object.keys(Hermes.instance.translations) as Langs[];

        for (const lang of langs) {
            const value = Hermes.instance.translations[lang].resolve(key, {});
            if (value !== undefined) object[lang] = value;
        }

        if (Object.keys(object).length === 0)
            throw new Error(`Localized object not found for key: ${key}`);

        return object;
    }

    public static getLocale(lang: Langs): string {
        return langToLocale[lang];
    }

}

function loadBuilt(built: BuiltTranslations): Record<Langs, LangData> {
    const translations = {} as Record<Langs, LangData>;
    const entries = Object.entries(built.langs) as Array<[Langs, BuiltTranslations['langs'][string]]>;

    for (const [lang, entry] of entries) {
        if (typeof entry !== 'string') translations[lang] = LangData.create(lang, entry.strings);
    }

    // An alias that loops or points at nothing is left out, and getContext falls back to the default
    // language for it, as 1.3 did: two empty files that fall back on each other must not stop init.
    for (const [lang, entry] of entries) {
        if (typeof entry !== 'string') continue;
        const target = resolveAlias(built, lang, translations);
        if (target) translations[lang] = target;
    }

    for (const [lang, entry] of entries) {
        if (typeof entry === 'string') continue;
        translations[lang].setFallbacks(entry.fallbacks.map(fallback => translations[fallback as Langs]).filter(Boolean));
    }

    return translations;
}

function resolveAlias(built: BuiltTranslations, lang: Langs, translations: Record<Langs, LangData>): LangData | undefined {
    const seen = new Set<string>();
    let target: string = lang;

    while (typeof built.langs[target] === 'string') {
        if (seen.has(target)) return undefined;
        seen.add(target);
        target = built.langs[target] as string;
    }

    return translations[target as Langs];
}

function loadLegacy(built: Record<string, Record<string, string> | string>): Record<Langs, LangData> {
    const translations = {} as Record<Langs, LangData>;

    for (const lang of Object.keys(built) as Array<Langs>) {
        const entry = built[lang];
        const data = typeof entry === 'string' ? translations[entry as Langs] : LangData.create(lang, entry);
        if (data) translations[lang] = data;
    }

    return translations;
}
