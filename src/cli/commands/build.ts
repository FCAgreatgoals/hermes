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

import { Command } from 'commander';
import {
    existsSync,
    mkdirSync,
    rmSync,
    writeFileSync
} from 'fs';
import { join } from 'path';

import { loadConfig } from '../HermesConfig';
import { collectLocales, findTotalFallbackRef, loadTranslations, loadTranslationsRaw } from '../utils';
import { validateTranslations } from '../validations';
import { TRANSLATIONS_FILE_NAME } from '../../constants';

export function registerBuildCommand(program: Command) {
    program
        .command('build')
        .description('Builds merged flat translation files per language with fallback support')
        .action(async () => {
            const config = loadConfig();

            if (existsSync(config.buildDir)) {
                rmSync(config.buildDir, { recursive: true });
            }

            mkdirSync(config.buildDir, { recursive: true });

            const locales = collectLocales(config);

            const rawTranslations: Record<string, Record<string, string>> = {};
            const totalFallbackRefs: Record<string, string> = {};

            for (const locale of locales) {
                const raw = loadTranslationsRaw(locale, config);
                const ref = findTotalFallbackRef(locale, raw, config, locales);

                if (ref) {
                    totalFallbackRefs[locale] = ref;
                } else {
                    rawTranslations[locale] = raw;
                }
            }

            if (config.checkTranslations) {
                validateTranslations(rawTranslations);
            }

            const translations: Record<string, Record<string, string> | string> = {};

            for (const locale of locales) {
                if (!totalFallbackRefs[locale]) {
                    translations[locale] = loadTranslations(locale, config);
                }
            }

            for (const [locale, ref] of Object.entries(totalFallbackRefs)) {
                translations[locale] = ref;
            }

            writeFileSync(join(config.buildDir, TRANSLATIONS_FILE_NAME), JSON.stringify(translations));

            console.log(`✅ Built ${locales.join(', ')}`);
        });
}
