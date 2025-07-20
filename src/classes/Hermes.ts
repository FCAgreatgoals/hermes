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

import { Langs, LangsKeys } from '../types/Langs.js'
import LangData from './LangData.js'
import Context from './Context.js';
import { LocalizedObject } from '../types/LocalizedObject.js';
import { readFileSync } from 'fs';

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
        translationDir: './.hermes', // default value
    }) {
        if (Hermes.instance)
            throw new Error('I18n already initialized');

        if (!options.translationDir)
            options.translationDir = './.hermes';

        Hermes.instance = new Hermes(options);

        const dir = options?.translationDir;

        const translations = JSON.parse(readFileSync(`${dir}/translations.json`, 'utf-8'));

        for (const lang of Object.keys(translations) as Array<Langs>) {
            Hermes.instance.translations[lang] = await LangData.create(lang, translations[lang]);
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

        if (!langData) {
            throw new Error(`Language not found: ${lang}`);
        }

        return Context.create(langData, basePath)
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

}
