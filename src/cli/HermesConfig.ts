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
}

export const DEFAULT_CONFIG: HermesConfig = {
    localesDir: DEFAULT_LOCALES_DIR,
    buildDir: DEFAULT_TRANSLATION_DIR,
    checkTranslations: true,
    keys: 'flat',
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
        try {
            // Try to load as ES module first
            delete require.cache[require.resolve(configPath)];
            const config = require(configPath).default as Partial<HermesConfig>;

            return {
                ...DEFAULT_CONFIG,
                ...config,
                fallbackChains: {
                    ...DEFAULT_CONFIG.fallbackChains,
                    ...config.fallbackChains
                }
            };
        } catch (error) {
            // If ES module loading fails, try CommonJS
            try {
                delete require.cache[require.resolve(configPath)];
                const config = require(configPath) as Partial<HermesConfig>;

                return {
                    ...DEFAULT_CONFIG,
                    ...config,
                    fallbackChains: {
                        ...DEFAULT_CONFIG.fallbackChains,
                        ...config.fallbackChains
                    }
                };
            } catch (secondError) {
                throw new Error(
                    `Failed to load config file at '${configPath}': ${(error as Error).message}`
                );
            }
        }
    }

    return DEFAULT_CONFIG;
}
