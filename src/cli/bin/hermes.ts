#!/usr/bin/env node
/**
 * This file is part of @fca.gg/hermes (https://github.com/FCAgreatgoals/hermes).
 *
 * Copyright (C) 2026 SAS French Community Agency
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
 *
 * Additional permission under the AGPL-3.0 section 7:
 * You may use this library as a dependency in your own application without
 * your application being subject to the AGPL-3.0. Only modifications to
 * @fca.gg/hermes itself must be made publicly available. See LINKING_EXCEPTION.md
 * for full details.
 */

import { Command } from 'commander';
import { registerBuildCommand } from '../commands/build';

const program = new Command();
program.name('hermes').description('Hermes CLI');

registerBuildCommand(program);

program.parse();
