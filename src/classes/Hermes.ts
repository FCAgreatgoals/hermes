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

import { readdir } from 'fs/promises'
import { Langs, LangsKeys } from '../types/Langs'
import LangData from './LangData'
import Context from './Context';
import { LocalizedObject } from '../types/LocalizedObject';

const getLogLevel = (strategy: WarnStrategy) => {
    switch (strategy) {
        case 'throw': return console.error;
        case 'warn': return console.warn;
        default: return console.log;
    }
}

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
 * @property {WarnStrategy} noMissingTranslations - Strategy for missing translations (throw, warn, ignore)
 * @property {WarnStrategy} noEmptyTranslations - Strategy for empty translations (throw, warn, ignore)
 */
export type HermesInitOptions = Partial<{
    translationDir: string,
    noMissingTranslations: WarnStrategy,
    noEmptyTranslations: WarnStrategy,
    fallbackLang: LangsKeys
}>

export default class Hermes {
    private constructor(options: HermesInitOptions) {
        this.options = options
    }
    private static instance: Hermes
    private translations: Record<Langs, LangData> = {} as Record<Langs, LangData>
    private readonly options: HermesInitOptions = {}

    /**
     * @method init
     * @description Initialize the i18n system
     *
     * @param options (optional) options for the i18n system
     */
    public static async init(options: HermesInitOptions = {
        translationDir: './translations', // default value
        noMissingTranslations: 'warn', // default value
        noEmptyTranslations: 'warn' // default value
    }) {
        if (Hermes.instance)
            throw new Error('I18n already initialized');

        if (!options.translationDir)
            options.translationDir = './translations';
        if (!options.noMissingTranslations)
            options.noMissingTranslations = 'warn';
        if (!options.noEmptyTranslations)
            options.noEmptyTranslations = 'warn';

        Hermes.instance = new Hermes(options);

        const dir = options?.translationDir;

        const files = await readdir(dir);
        for (const file of files) {
            const lang = file.replace('.json', '') as Langs;
            if (!Object.values(Langs).includes(lang))
                continue;

            Hermes.instance.translations[lang] = await LangData.create(lang, `${dir}/${file}`);
        }

        try {
            if (options?.noMissingTranslations && options.noMissingTranslations !== 'ignore')
                Hermes.instance.checkTranslations();
            if (options?.noEmptyTranslations && options.noEmptyTranslations !== 'ignore')
                Hermes.instance.checkEmptyTranslations();
        } catch (e: any) {
            throw new Error(e.message);
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
    public static getContext(lang: LangsKeys, basePath: string = '') {
        if (!Hermes.instance)
            throw new Error('I18n not initialized');

        const langData = Hermes.instance.translations[lang]

        const fallbackLang = Hermes.instance.options.fallbackLang
        const fallbackData = fallbackLang ? Hermes.instance.translations[fallbackLang] : undefined

        if (!langData) {
            if (!fallbackLang)
                throw new Error(`Language not found: ${lang}`);
            if (!fallbackData)
                throw new Error(`Fallback language not found: ${fallbackLang}`);
        }

        return Context.create(langData ?? fallbackData, basePath, langData ? fallbackData : undefined)
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

    private checkTranslations() {
        const langs = Object.keys(this.translations) as Langs[];

        const missingTranslations: Record<Langs, Set<string>> = {} as Record<Langs, Set<string>>;

        for (const lang of langs) {
            if (!missingTranslations[lang])
                missingTranslations[lang] = new Set<string>();

            for (const key of Object.keys(this.translations[lang].getStrings())) {
                for (const lang2 of langs) {
                    if (lang === lang2)
                        continue;

                    if (!this.translations[lang2].getStrings()[key]) {
                        if (!missingTranslations[lang2])
                            missingTranslations[lang2] = new Set<string>();

                        missingTranslations[lang2].add(key);
                    }
                }
            }
        }

        const missingTranslationsCount = langs.reduce((acc, lang) => acc + missingTranslations[lang].size, 0);
        if (missingTranslationsCount === 0)
            return;

        const logLevel = getLogLevel(this.options.noMissingTranslations!);
        logLevel('[i18n] Missing translations:');

        for (const lang of langs) {
            if (missingTranslations[lang].size === 0)
                continue;

            logLevel(`- ${lang}: ${missingTranslations[lang].size} missing translations:`);

            for (const key of missingTranslations[lang])
                logLevel(`  - ${key}`);
        }

        if (this.options.noMissingTranslations === 'throw')
            throw new Error('Missing translations');

        return;
    }

    private checkEmptyTranslations() {
        const langs = Object.keys(this.translations) as Langs[];

        const emptyTranslations: Record<Langs, Set<string>> = {} as Record<Langs, Set<string>>;

        for (const lang of langs) {
            emptyTranslations[lang] = new Set<string>();

            for (const [key, value] of Object.entries(this.translations[lang].getStrings())) {
                if (value.isEmpty())
                    emptyTranslations[lang].add(key);
            }
        }

        const emptyTranslationsCount = langs.reduce((acc, lang) => acc + emptyTranslations[lang].size, 0);
        if (emptyTranslationsCount === 0)
            return;

        const logLevel = getLogLevel(this.options.noEmptyTranslations!);
        logLevel('[i18n] Empty translations:');

        for (const lang of langs) {
            if (emptyTranslations[lang].size === 0)
                continue;

            logLevel(`- ${lang}: ${emptyTranslations[lang].size} empty translations:`);

            for (const key of emptyTranslations[lang])
                logLevel(`  - ${key}`);
        }

        if (this.options.noEmptyTranslations === 'throw')
            throw new Error('Empty translations');

        return;
    }

}
