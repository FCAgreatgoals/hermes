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

import { loadConfig } from '../HermesConfig';
import { collectRawTranslations } from '../utils';
import { lockEntriesFor, readLock, writeLock } from '../lock';

/**
 * Records the source fingerprints a locale is currently translated from. Run it once a translation
 * pass is done, in the same commit: a lock that drifts from the files it describes reports work
 * that is already finished, or hides work that is not.
 *
 * Every locale is tracked, partial ones included. Being partial says nothing about whether what has
 * been translated is still current.
 */
export function registerLockCommand(program: Command) {
    program
        .command('lock')
        .description('Marks translations as up to date with the current source')
        .argument('[locales...]', 'locales to lock (default: all)')
        .option('-k, --keys <keys>', 'comma-separated keys to lock, leaving the rest untouched')
        .action(async (locales: string[], options: { keys?: string }) => {
            const config = loadConfig();

            if (!config.sourceLocale)
                throw new Error('hermes lock needs a sourceLocale in hermes.config.js');

            const raw = collectRawTranslations(config);
            const source = raw[config.sourceLocale];

            if (!source)
                throw new Error(`Source locale "${config.sourceLocale}" has no translations`);

            const targets = (locales.length > 0 ? locales : Object.keys(raw))
                .filter(locale => locale !== config.sourceLocale);

            const only = options.keys?.split(',').map(key => key.trim()).filter(Boolean);
            const lock = readLock(config);

            for (const locale of targets) {
                if (!raw[locale]) {
                    console.warn(`- ${locale}: no translations, skipped`);
                    continue;
                }

                const entries = lockEntriesFor(raw[locale], source);

                // `--keys` accepts a source edit without claiming the rest was reviewed: useful when
                // the change was cosmetic and the existing translations still hold.
                if (only) {
                    lock[locale] ??= {};
                    for (const key of only)
                        if (entries[key]) lock[locale][key] = entries[key];
                } else {
                    lock[locale] = entries;
                }

                console.log(`- ${locale}: ${only ? `${only.length} key(s)` : `${Object.keys(entries).length} key(s)`} locked`);
            }

            writeLock(config, lock);
        });
}
