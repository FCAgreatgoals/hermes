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
export type HermesInitOptions =  Partial<{
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
        if (!Hermes.instance.translations[lang]) {
            if (!Hermes.instance.options.fallbackLang)
                throw new Error(`Language not found: ${lang}`);
            if (!Hermes.instance.translations[Hermes.instance.options.fallbackLang])
                throw new Error(`Fallback language not found: ${Hermes.instance.options.fallbackLang}`);
            return Context.create(Hermes.instance.translations[Hermes.instance.options.fallbackLang], basePath);
        }
        return Context.create(Hermes.instance.translations[lang], basePath);
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

        const missingTranslations: Record<Langs, string[]> = {} as Record<Langs, string[]>;
        for (const lang of langs) {
            missingTranslations[lang] = [];
            for (const [key] of Object.entries(this.translations[lang].getStrings())) {
                for (const lang2 of langs) {
                    if (lang === lang2)
                        continue;
                    if (!this.translations[lang2].getStrings()[key])
                        missingTranslations[lang2].push(key);
                }
            }
        }

        const missingTranslationsCount = langs.reduce((acc, lang) => acc + missingTranslations[lang].length, 0);
        if (missingTranslationsCount === 0)
            return;
        const logLevel = getLogLevel(this.options.noMissingTranslations!);
        logLevel('[i18n] Missing translations:');
        for (const lang of langs) {
            if (missingTranslations[lang].length === 0)
                continue;
            logLevel(`- ${lang}: ${missingTranslations[lang].length} missing translations:`);
            for (const key of missingTranslations[lang])
                logLevel(`  - ${key}`);
        }
        if (this.options.noMissingTranslations === 'throw')
            throw new Error('Missing translations');
        return;
    }

    private checkEmptyTranslations() {
        const langs = Object.keys(this.translations) as Langs[];

        const emptyTranslations: Record<Langs, string[]> = {} as Record<Langs, string[]>;
        for (const lang of langs) {
            emptyTranslations[lang] = [];
            for (const [key, value] of Object.entries(this.translations[lang].getStrings())) {
                if (value.isEmpty())
                    emptyTranslations[lang].push(key);
            }
        }

        const emptyTranslationsCount = langs.reduce((acc, lang) => acc + emptyTranslations[lang].length, 0);
        if (emptyTranslationsCount === 0)
            return;
        const logLevel = getLogLevel(this.options.noEmptyTranslations!);
        logLevel('[i18n] Empty translations:');
        for (const lang of langs) {
            if (emptyTranslations[lang].length === 0)
                continue;
            logLevel(`- ${lang}: ${emptyTranslations[lang].length} empty translations:`);
            for (const key of emptyTranslations[lang])
                logLevel(`  - ${key}`);
        }
        if (this.options.noEmptyTranslations === 'throw')
            throw new Error('Empty translations');
        return;
    }

}
