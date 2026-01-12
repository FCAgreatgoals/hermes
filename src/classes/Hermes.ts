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

import { LangsKeys, LocalizedObject } from '../types';
import { Langs, DEFAULT_TRANSLATION_DIR, TRANSLATIONS_FILE_NAME, langToLocale } from '../constants';
import LangData from './LangData';
import Context from './Context';
import { DEFAULT_CONFIG } from '../cli/HermesConfig';

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
    public static init(options: HermesInitOptions = {
        translationDir: DEFAULT_TRANSLATION_DIR, // default value
        defaultLocale: DEFAULT_CONFIG.fallbackChains.default[0] // default value
    }) {
        if (Hermes.instance)
            throw new Error('I18n already initialized');

        if (!options.translationDir)
            options.translationDir = DEFAULT_TRANSLATION_DIR;

        Hermes.instance = new Hermes(
            options.defaultLocale ?? DEFAULT_CONFIG.fallbackChains.default[0]
        );

        const dir = options?.translationDir;

        const translations = JSON.parse(readFileSync(`${dir}/${TRANSLATIONS_FILE_NAME}`, 'utf-8'));

        for (const lang of Object.keys(translations) as Array<Langs>) {
            Hermes.instance.translations[lang] = LangData.create(lang, translations[lang]);
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

        const langData = Hermes.instance.translations[lang === 'default' ? Hermes.instance.defaultLocale : lang];

        if (!langData) {
            throw new Error(`Language not found: ${lang}`);
        }

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
            if (!Hermes.instance.translations[lang].getStrings()[key])
                continue;
            object[lang] = Hermes.instance.translations[lang].getStrings()[key].resolve({});
        }

        if (Object.keys(object).length === 0)
            throw new Error(`Localized object not found for key: ${key}`);

        return object;
    }

    public static getLocale(lang: Langs): string {
        return langToLocale[lang];
    }

}
