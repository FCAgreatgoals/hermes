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

import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { HermesConfig } from './HermesConfig';
import { LOCK_FILE_NAME } from '../constants';

/**
 * Fingerprint of every source string a locale has been translated from, per locale.
 *
 * A translation whose source has changed since is a regression: the string is still there, still
 * looks fine, and no longer says what the source says. Nothing but a recorded fingerprint can tell
 * that apart from an up-to-date translation.
 */
export type TranslationLock = Record<string, Record<string, string>>;

export interface LocaleAudit {
    /** In the source, absent here. Only meaningful for locales expected to be complete. */
    missing: string[]
    /** Translated, but the source moved since. */
    outdated: string[]
    /** Here, absent from the source. */
    orphan: string[]
    /** Present but empty. */
    empty: string[]
}

export function fingerprint(value: string): string {
    return createHash('sha1').update(value).digest('hex').slice(0, 12);
}

export function lockPath(config: HermesConfig): string {
    return join(config.localesDir, LOCK_FILE_NAME);
}

export function readLock(config: HermesConfig): TranslationLock {
    const path = lockPath(config);

    if (!existsSync(path))
        return {};

    return JSON.parse(readFileSync(path, 'utf-8'));
}

/**
 * Written by `hermes lock` only, never by `hermes build`: a build that recorded fingerprints would
 * mark every stale translation as current on the first CI run, and the lock would never flag
 * anything again.
 */
export function writeLock(config: HermesConfig, lock: TranslationLock): void {
    const sorted: TranslationLock = {};

    for (const locale of Object.keys(lock).sort()) {
        const entries = lock[locale];
        sorted[locale] = {};

        for (const key of Object.keys(entries).sort())
            sorted[locale][key] = entries[key];
    }

    writeFileSync(lockPath(config), `${JSON.stringify(sorted, null, 4)}\n`, 'utf-8');
}

/** Keys worth translating: the source ones that actually carry a string. */
export function translatableKeys(source: Record<string, string>): string[] {
    return Object.keys(source).filter(key => source[key] !== '' && source[key] !== null && source[key] !== undefined);
}

export function auditLocale(
    translations: Record<string, string>,
    source: Record<string, string>,
    locked: Record<string, string> = {}
): LocaleAudit {
    const audit: LocaleAudit = { missing: [], outdated: [], orphan: [], empty: [] };

    for (const key of translatableKeys(source)) {
        const current = translations[key];

        if (current === undefined) {
            audit.missing.push(key);
            continue;
        }

        if (current === '') {
            audit.empty.push(key);
            continue;
        }

        if (locked[key] !== fingerprint(source[key]))
            audit.outdated.push(key);
    }

    // A key left empty on purpose in the source is not an empty translation, it is an empty string.
    for (const key of Object.keys(translations))
        if (!(key in source)) audit.orphan.push(key);

    return audit;
}

/** Fingerprints for what a locale currently holds. Untranslated keys stay out of the lock. */
export function lockEntriesFor(
    translations: Record<string, string>,
    source: Record<string, string>
): Record<string, string> {
    const entries: Record<string, string> = {};

    for (const key of translatableKeys(source)) {
        const current = translations[key];

        if (current !== undefined && current !== '')
            entries[key] = fingerprint(source[key]);
    }

    return entries;
}
