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

import { Langs } from '../constants';

export function validateTranslations(allTranslations: Partial<Record<Langs, Record<string, string>>>) {
    const langs = Object.keys(allTranslations) as Langs[];

    const missing = {} as Record<Langs, Set<string>>;
    const empty = {} as Record<Langs, Set<string>>;

    for (const lang of langs) {
        const current = allTranslations[lang] ?? {};

        if (!missing[lang])
            missing[lang] = new Set<string>();
        if (!empty[lang])
            empty[lang] = new Set<string>();

        for (const key of Object.keys(current)) {
            if (isEmptyTranslation(current[key]))
                empty[lang].add(key);

            for (const otherLang of langs) {
                if (otherLang === lang)
                    continue;

                checkMissingInLang(key, otherLang, allTranslations, missing);
            }
        }
    }

    checkMissingTranslations(langs, missing);
    checkEmptyTranslations(langs, empty);
}

function checkMissingInLang(key: string, lang: Langs, allTranslations: Partial<Record<Langs, Record<string, string>>>, missing: Partial<Record<Langs, Set<string>>>) {
    if (!(key in (allTranslations[lang] ?? {}))) {
        if (!missing[lang])
            missing[lang] = new Set<string>();

        missing[lang]!.add(key);
    }
}

function isEmptyTranslation(value: string | null | undefined): boolean {
    return value === '' || value === null || value === undefined;
}

export function checkMissingTranslations(langs: Langs[], missing: Partial<Record<Langs, Set<string>>>): void {
    const missingCount = langs.reduce((acc, l) => acc + (missing[l]?.size ?? 0), 0);

    if (missingCount > 0) {
        console.warn('[i18n] Missing translations:');
        for (const lang of langs) {
            if (!missing[lang])
                continue;

            if (missing[lang]!.size > 0) {
                console.warn(`- ${lang}: ${missing[lang]!.size} missing:`);
                for (const key of missing[lang]!) console.warn(`  - ${key}`);
            }
        }
    }
}

export function checkEmptyTranslations(langs: Langs[], empty: Partial<Record<Langs, Set<string>>>): void {
    const emptyCount = langs.reduce((acc, l) => acc + (empty[l]?.size ?? 0), 0);

    if (emptyCount > 0) {
        console.warn('[i18n] Empty translations:');
        for (const lang of langs) {
            if (!empty[lang])
                continue;

            if (empty[lang]!.size > 0) {
                console.warn(`- ${lang}: ${empty[lang]!.size} empty:`);
                for (const key of empty[lang]!) console.warn(`  - ${key}`);
            }
        }
    }
}
