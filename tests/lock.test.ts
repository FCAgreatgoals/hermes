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

import {
    auditLocale,
    decodeEntry,
    encodeEntry,
    fingerprint,
    lockEntriesFor,
    refreshLock,
    TranslationLock
} from '../src/cli/lock';

const SOURCE = { greet: 'Bonjour', bye: 'Au revoir', blank: '' };

function lockOf(translations: Record<string, string>): TranslationLock {
    return { de: lockEntriesFor(translations, SOURCE) };
}

describe('audit', () => {
    test('a translated key matching its locked source is clean', () => {
        const de = { greet: 'Hallo', bye: 'Tschüss' };

        expect(auditLocale(de, SOURCE, lockOf(de).de)).toEqual({
            missing: [], outdated: [], orphan: [], empty: []
        });
    });

    test('a key the source no longer matches is outdated', () => {
        const de = { greet: 'Hallo', bye: 'Tschüss' };
        const lock = lockOf(de).de;

        const audit = auditLocale(de, { ...SOURCE, greet: 'Salut' }, lock);

        expect(audit.outdated).toEqual(['greet']);
        expect(audit.missing).toEqual([]);
    });

    test('an untranslated key is missing, an empty source key is neither', () => {
        const audit = auditLocale({ greet: 'Hallo' }, SOURCE, lockOf({ greet: 'Hallo' }).de);

        expect(audit.missing).toEqual(['bye']);
        expect(audit.empty).toEqual([]);
    });

    test('a key absent from the source is an orphan', () => {
        const de = { greet: 'Hallo', bye: 'Tschüss', gone: 'Weg' };

        expect(auditLocale(de, SOURCE, lockOf(de).de).orphan).toEqual(['gone']);
    });

    test('an unlocked translation is outdated, since nothing says what it was made from', () => {
        expect(auditLocale({ greet: 'Hallo' }, SOURCE, {}).outdated).toEqual(['greet']);
    });
});

describe('refresh', () => {
    test('a translation edited after the source moved clears its regression', () => {
        const de = { greet: 'Hallo' };
        const lock = lockOf(de);
        const moved = { ...SOURCE, greet: 'Salut' };

        expect(auditLocale(de, moved, lock.de).outdated).toEqual(['greet']);

        const fixed = { greet: 'Salut Hallo' };

        expect(refreshLock(lock, { de: fixed }, moved, 'fr')).toBe(true);
        expect(auditLocale(fixed, moved, lock.de).outdated).toEqual([]);
    });

    test('a translation left alone stays flagged however many builds run', () => {
        const de = { greet: 'Hallo' };
        const lock = lockOf(de);
        const moved = { ...SOURCE, greet: 'Salut' };

        refreshLock(lock, { de }, moved, 'fr');
        refreshLock(lock, { de }, moved, 'fr');

        expect(auditLocale(de, moved, lock.de).outdated).toEqual(['greet']);
    });

    test('a locale absent from the lock is never fingerprinted on its own', () => {
        const lock: TranslationLock = {};

        expect(refreshLock(lock, { de: { greet: 'Hallo' } }, SOURCE, 'fr')).toBe(false);
        expect(lock).toEqual({});
    });

    test('a newly translated key joins a locale the lock already covers', () => {
        const lock = lockOf({ greet: 'Hallo' });

        expect(refreshLock(lock, { de: { greet: 'Hallo', bye: 'Tschüss' } }, SOURCE, 'fr')).toBe(true);
        expect(auditLocale({ greet: 'Hallo', bye: 'Tschüss' }, SOURCE, lock.de).outdated).toEqual([]);
    });

    test('a removed translation drops out of the lock', () => {
        const lock = lockOf({ greet: 'Hallo', bye: 'Tschüss' });

        expect(refreshLock(lock, { de: { greet: 'Hallo' } }, SOURCE, 'fr')).toBe(true);
        expect(lock.de.bye).toBeUndefined();
    });

    test('a source-only entry is backfilled without clearing a pending regression', () => {
        const moved = { ...SOURCE, greet: 'Salut' };
        const lock: TranslationLock = { de: { greet: fingerprint(SOURCE.greet) } };

        expect(refreshLock(lock, { de: { greet: 'Hallo' } }, moved, 'fr')).toBe(true);
        expect(decodeEntry(lock.de.greet)).toEqual({
            source: fingerprint(SOURCE.greet),
            target: fingerprint('Hallo')
        });
        expect(auditLocale({ greet: 'Hallo' }, moved, lock.de).outdated).toEqual(['greet']);
    });
});

describe('entries', () => {
    test('an entry survives a round trip, with or without a translation fingerprint', () => {
        expect(decodeEntry(encodeEntry({ source: 'a', target: 'b' }))).toEqual({ source: 'a', target: 'b' });
        expect(decodeEntry(encodeEntry({ source: 'a' }))).toEqual({ source: 'a', target: undefined });
        expect(decodeEntry(undefined)).toBeNull();
    });

    test('an empty source key is not worth locking', () => {
        expect(lockEntriesFor({ blank: '' }, SOURCE)).toEqual({});
    });
});
