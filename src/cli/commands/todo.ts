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
import { auditLocale, readLock } from '../lock';

/**
 * What a locale still needs, as JSON on stdout. Outdated entries carry the translation currently in
 * place next to the new source: a retouch is cheaper than a rewrite, for a human and for a machine
 * alike.
 */
export function registerTodoCommand(program: Command) {
    program
        .command('todo')
        .description('Prints the keys a locale still needs, as JSON')
        .argument('<locale>', 'locale to inspect')
        .action(async (locale: string) => {
            const config = loadConfig();

            if (!config.sourceLocale)
                throw new Error('hermes todo needs a sourceLocale in hermes.config.js');

            const raw = collectRawTranslations(config);
            const source = raw[config.sourceLocale];

            if (!source)
                throw new Error(`Source locale "${config.sourceLocale}" has no translations`);

            const audit = auditLocale(raw[locale] ?? {}, source, readLock(config)[locale]);
            const complete = config.completeLocales ?? Object.keys(raw);

            const missing: Record<string, string> = {};
            const outdated: Record<string, { source: string, current: string }> = {};

            if (complete.includes(locale))
                for (const key of audit.missing) missing[key] = source[key];

            for (const key of audit.outdated)
                outdated[key] = { source: source[key], current: raw[locale][key] };

            console.log(JSON.stringify({
                locale,
                sourceLocale: config.sourceLocale,
                complete: complete.includes(locale),
                missing,
                outdated,
                orphan: audit.orphan
            }, null, 2));
        });
}
