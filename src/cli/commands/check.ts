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
import { validateTranslations } from '../validations';
import { Langs } from '../../constants';

/**
 * Same checks as `build`, but with an exit code: for a CI step that should stop a merge, where a
 * build only warns on its way to producing a bundle.
 */
export function registerCheckCommand(program: Command) {
    program
        .command('check')
        .description('Fails when a complete locale is missing keys, or any locale is outdated')
        .action(async () => {
            const config = loadConfig();
            const raw = collectRawTranslations(config);
            const { audits } = validateTranslations(raw as Partial<Record<Langs, Record<string, string>>>, config);

            const blocking = Object.values(audits).reduce(
                (total, audit) => total + audit.missing.length + audit.outdated.length,
                0
            );

            if (blocking > 0)
                process.exit(1);

            console.log('✅ Translations are up to date');
        });
}
