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

import { Langs } from "./constants";

export type LangsKeys = `${Langs}`;

export type LocalizedObject = Partial<Record<Langs, string>>;

export interface RecursiveRecord {
    [key: string]: string | RecursiveRecord;
}

/**
 * What `hermes build` writes. Each language holds only the strings it owns, plus the languages to
 * look into, in order, for the rest. A string is a whole-language alias.
 */
export interface BuiltTranslations {
    $hermes: 2
    langs: Record<string, string | {
        fallbacks: string[]
        strings: Record<string, string>
    }>
}

export function isBuiltTranslations(value: unknown): value is BuiltTranslations {
    return typeof value === 'object' && value !== null && (value as { $hermes?: unknown }).$hermes === 2;
}

