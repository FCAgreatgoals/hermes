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
 * Per locale, per key: the fingerprint of the source string a translation was made from, and the
 * fingerprint of the translation itself, stored as `source:target`.
 *
 * A translation whose source has changed since is a regression: the string is still there, still
 * looks fine, and no longer says what the source says. Nothing but a recorded fingerprint can tell
 * that apart from an up-to-date translation.
 *
 * The second fingerprint is what lets a build tell a regression from a fix. Source moved and
 * translation untouched means nobody has answered yet; both moved means someone did, and the entry
 * refreshes itself. Without it, every translation pass would have to be followed by a command, and
 * the report would fill with work already done until someone remembered to run it.
 */
export type TranslationLock = Record<string, Record<string, string>>;

export interface LockEntry {
    source: string
    /** Absent on entries written before translations were fingerprinted. */
    target?: string
}

export function encodeEntry(entry: LockEntry): string {
    return entry.target === undefined ? entry.source : `${entry.source}:${entry.target}`;
}

export function decodeEntry(raw: string | undefined): LockEntry | null {
    if (!raw)
        return null;

    const [source, target] = raw.split(':');

    return { source, target };
}

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
 * A build only ever refreshes locales the lock already knows (see `refreshLock`). Creating entries
 * from nothing is left to `hermes lock`, because a build that fingerprinted an unlocked project
 * would mark all of it as current on the first run, stale translations included, and never flag
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

        if (decodeEntry(locked[key])?.source !== fingerprint(source[key]))
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
            entries[key] = encodeEntry({ source: fingerprint(source[key]), target: fingerprint(current) });
    }

    return entries;
}

/**
 * Keeps the lock in step with what translators actually did, for locales it already covers.
 *
 * A translation that moved is taken as answered and its entry refreshed. One that did not stays
 * flagged, however many times the build runs. A locale absent from the lock is left alone: it has
 * never been baselined, and guessing on its behalf is how a lock ends up blessing stale work.
 *
 * Returns true when the file needs writing.
 */
export function refreshLock(
    lock: TranslationLock,
    translations: Record<string, Record<string, string>>,
    source: Record<string, string>,
    sourceLocale: string
): boolean {
    let changed = false;

    for (const locale of Object.keys(lock)) {
        if (locale === sourceLocale || !translations[locale])
            continue;

        const current = translations[locale];
        const entries = lock[locale];

        for (const key of Object.keys(entries)) {
            const translation = current[key];

            // Translation gone: the key is untranslated again, and nothing is locked about it.
            if (translation === undefined || translation === '') {
                delete entries[key];
                changed = true;
                continue;
            }

            const entry = decodeEntry(entries[key])!;
            const target = fingerprint(translation);

            // Written before translations were fingerprinted: record the translation as it stands
            // without touching the source side, so a pending regression stays pending.
            if (entry.target === undefined) {
                entries[key] = encodeEntry({ source: entry.source, target });
                changed = true;
                continue;
            }

            if (entry.target === target)
                continue;

            entries[key] = encodeEntry({ source: fingerprint(source[key]), target });
            changed = true;
        }

        // Translated since the last pass: nothing to compare against, everything to record.
        for (const key of translatableKeys(source)) {
            if (entries[key] !== undefined)
                continue;

            const translation = current[key];

            if (translation === undefined || translation === '')
                continue;

            entries[key] = encodeEntry({ source: fingerprint(source[key]), target: fingerprint(translation) });
            changed = true;
        }
    }

    return changed;
}
