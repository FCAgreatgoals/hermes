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

import { resolve } from 'path';
import { existsSync } from 'fs';

import {
    Langs,
    DEFAULT_TRANSLATION_DIR,
    DEFAULT_LOCALES_DIR,
    CONFIG_FILE_NAME
} from '../constants';

export type KeysType = 'namespaced' | 'path' | 'flat';

export interface HermesConfig {
    localesDir: string
    buildDir: string
    checkTranslations: boolean
    keys: KeysType
    fallbackChains: Record<string, Langs[]>
    /**
     * Language everything is written in. Set it to compare translations against a single source
     * rather than against each other, and to have `hermes build` report translations whose source
     * has changed since. Left unset, every language is checked against the union of all the others,
     * and no source tracking happens.
     */
    sourceLocale: string | null
    /**
     * Languages expected to hold every source key. Defaults to all of them; name a subset when some
     * languages are deliberately partial, so that missing keys are only reported where they are a
     * problem. Source tracking still applies everywhere: a partial language that translated a
     * string is told when that string moves.
     */
    completeLocales: string[] | null
}

export const DEFAULT_CONFIG: HermesConfig = {
    localesDir: DEFAULT_LOCALES_DIR,
    buildDir: DEFAULT_TRANSLATION_DIR,
    checkTranslations: true,
    keys: 'flat',
    sourceLocale: null,
    completeLocales: null,
    fallbackChains: {
        [Langs.DANISH]: [Langs.SWEDISH, Langs.NORWEGIAN],
        [Langs.ENGLISH_UK]: [Langs.ENGLISH_US],
        [Langs.ENGLISH_US]: [Langs.ENGLISH_UK],
        [Langs.SPANISH]: [Langs.SPANISH_LATAM],
        [Langs.SPANISH_LATAM]: [Langs.SPANISH],
        [Langs.ITALIAN]: [Langs.SPANISH],
        [Langs.DUTCH]: [Langs.ENGLISH_US, Langs.ENGLISH_UK, Langs.GERMAN],
        [Langs.NORWEGIAN]: [Langs.SWEDISH, Langs.DANISH],
        [Langs.FINNISH]: [Langs.SWEDISH],
        [Langs.SWEDISH]: [Langs.NORWEGIAN, Langs.DANISH],
        [Langs.CHINESE_CHINA]: [Langs.CHINESE_TAIWAN],
        [Langs.CHINESE_TAIWAN]: [Langs.CHINESE_CHINA],
        default: [Langs.ENGLISH_US, Langs.ENGLISH_UK]
    }
};

export function loadConfig(): HermesConfig {
    const configPath = resolve(CONFIG_FILE_NAME);

    if (existsSync(configPath)) {
        const config = require(configPath).default as Partial<HermesConfig>;

        return {
            ...DEFAULT_CONFIG,
            ...config,
            fallbackChains: {
                ...DEFAULT_CONFIG.fallbackChains,
                ...config.fallbackChains
            }
        };
    }

    return DEFAULT_CONFIG;
}
