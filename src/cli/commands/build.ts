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

import { HermesConfig, loadConfig } from '../HermesConfig';
import { collectLocales, findTotalFallbackRef, loadTranslations, loadTranslationsRaw, resolutionOrder } from '../utils';
import { validateTranslations } from '../validations';
import { readLock, refreshLock, writeLock } from '../lock';
import { Langs, TRANSLATIONS_FILE_NAME } from '../../constants';
import { BuiltTranslations } from '../../types';
import { FormattedString } from '../../classes/format/FormattedString';

export function registerBuildCommand(program: Command) {
    program
        .command('build')
        .description('Builds one translation file holding each language\'s own strings and its fallback order')
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

            const source = config.sourceLocale ? rawTranslations[config.sourceLocale] : undefined;

            // Before reporting, not after: a translation fixed since the last build has answered its
            // regression, and repeating it would train everyone to scroll past the whole section.
            if (config.sourceLocale && source) {
                const lock = readLock(config);

                if (refreshLock(lock, rawTranslations, source, config.sourceLocale))
                    writeLock(config, lock);
            }

            if (config.checkTranslations) {
                validateTranslations(rawTranslations as Partial<Record<Langs, Record<string, string>>>, config);
            }

            const output = buildTranslations(locales, rawTranslations, totalFallbackRefs, config);

            writeFileSync(join(config.buildDir, TRANSLATIONS_FILE_NAME), JSON.stringify(output));

            console.log(`✅ Built ${locales.join(', ')}`);
        });
}

/**
 * Keeps, for each language, only the strings its fallbacks would not already give, so that the
 * runtime shares one instance where it used to hold one copy per language. Every key still resolves
 * to the text the fully merged build gave it: that is checked here rather than assumed.
 */
export function buildTranslations(
    locales: string[],
    raw: Record<string, Record<string, string>>,
    aliases: Record<string, string>,
    config: HermesConfig
): BuiltTranslations {
    const concrete = locales.filter(locale => !aliases[locale]);
    const orders: Record<string, string[]> = {};
    const kept: Record<string, Record<string, string>> = {};

    const expected: Record<string, Record<string, string>> = {};

    for (const locale of concrete) {
        expected[locale] = loadTranslations(locale, config);
        orders[locale] = resolutionOrder(locale, config).filter(lang => raw[lang]);
        kept[locale] = { ...raw[locale] };
    }

    const lookup = (locale: string, key: string): string | undefined => {
        if (Object.hasOwn(kept[locale], key)) return kept[locale][key];
        for (const fallback of orders[locale]) if (Object.hasOwn(kept[fallback], key)) return kept[fallback][key];
        return undefined;
    };

    // Fallback chains can loop (en-US and en-GB point at each other): the default language stays
    // whole so that it is the one the others lean on, not the reverse.
    const anchor = config.fallbackChains.default?.[0];

    for (const locale of concrete) {
        if (locale === anchor) continue;

        for (const key of Object.keys(kept[locale])) {
            const value = kept[locale][key];
            delete kept[locale][key];
            if (lookup(locale, key) !== value) kept[locale][key] = value;
        }
    }

    // A string dropped from one language may have been what another one fell back to.
    for (let changed = true; changed;) {
        changed = false;

        for (const locale of concrete) {
            for (const [key, value] of Object.entries(expected[locale])) {
                if (lookup(locale, key) === value) continue;
                kept[locale][key] = value;
                changed = true;
            }
        }
    }

    const errors: string[] = [];
    const langs: BuiltTranslations['langs'] = {};

    for (const locale of concrete) {
        for (const [key, value] of Object.entries(kept[locale])) {
            if (!value.includes('%')) continue;
            try {
                FormattedString.create(value);
            } catch (e) {
                errors.push(`${locale} ${key}: ${(e as Error).message}`);
            }
        }

        langs[locale] = { fallbacks: orders[locale], strings: kept[locale] };
    }

    if (errors.length) throw new Error(`Invalid translations:\n${errors.join('\n')}`);

    for (const [locale, ref] of Object.entries(aliases)) langs[locale] = ref;

    return { $hermes: 2, langs };
}

