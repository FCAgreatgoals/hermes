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
import { HermesConfig } from './HermesConfig';
import { auditLocale, LocaleAudit, readLock } from './lock';

export interface ValidationReport {
    audits: Record<string, LocaleAudit>
    complete: string[]
}

/**
 * Reports what is wrong with a set of translations.
 *
 * With a `sourceLocale` configured, everything is compared against it: missing keys are reported
 * for the languages expected to be complete, and outdated ones everywhere, since a language that
 * translated a string deserves to know when that string moves, complete or not.
 *
 * Without one, the historical behaviour applies: every language is checked against the union of all
 * the others, and nothing tracks the source.
 */
export function validateTranslations(
    allTranslations: Partial<Record<Langs, Record<string, string>>>,
    config?: HermesConfig
): ValidationReport {
    const langs = Object.keys(allTranslations) as Langs[];

    if (!config?.sourceLocale)
        return { audits: legacyAudit(langs, allTranslations), complete: langs };

    const source = allTranslations[config.sourceLocale as Langs];

    if (!source) {
        console.warn(`[i18n] Source locale "${config.sourceLocale}" has no translations, skipping source checks.`);
        return { audits: {}, complete: [] };
    }

    const complete = config.completeLocales ?? langs;
    const lock = readLock(config);
    const audits: Record<string, LocaleAudit> = {};

    for (const lang of langs) {
        if (lang === config.sourceLocale)
            continue;

        const audit = auditLocale(allTranslations[lang] ?? {}, source, lock[lang]);

        // A deliberately partial language is not missing anything, it just is not finished.
        if (!complete.includes(lang))
            audit.missing = [];

        audits[lang] = audit;
    }

    report(audits, config.sourceLocale);

    return { audits, complete };
}

function report(audits: Record<string, LocaleAudit>, sourceLocale: string): void {
    // Listed first: an outdated string is served to users as if it were current, where a missing one
    // falls back visibly.
    printSection(
        audits,
        'outdated',
        `[i18n] Outdated translations (${sourceLocale} changed since):`,
        'run `hermes todo <locale>` for the strings; the lock clears itself once they are translated'
    );
    printSection(audits, 'missing', '[i18n] Missing translations:');
    printSection(audits, 'empty', '[i18n] Empty translations:');
    printSection(audits, 'orphan', `[i18n] Keys absent from ${sourceLocale}:`);
}

function printSection(
    audits: Record<string, LocaleAudit>,
    kind: keyof LocaleAudit,
    title: string,
    hint?: string
): void {
    const affected = Object.keys(audits).filter(lang => audits[lang][kind].length > 0);

    if (affected.length === 0)
        return;

    console.warn(title);

    // Languages sharing the exact same gap are listed together: a new key added to the source is the
    // same gap in every language, and repeating it once per language buries the rest of the report.
    const groups = new Map<string, string[]>();

    for (const lang of affected) {
        const signature = audits[lang][kind].join('\u0000');

        groups.set(signature, [...(groups.get(signature) ?? []), lang]);
    }

    for (const [signature, langs] of groups) {
        const keys = signature.split('\u0000');

        console.warn(`- ${langs.join(', ')}: ${keys.length}`);
        for (const key of keys.slice(0, MAX_LISTED)) console.warn(`  - ${key}`);
        if (keys.length > MAX_LISTED) console.warn(`  … ${keys.length - MAX_LISTED} more`);
    }

    if (hint)
        console.warn(`  ${hint}`);
}

// A fresh language reports thousands of keys otherwise, and the useful lines scroll away.
const MAX_LISTED = 20;

/** Pre-source behaviour: a key present anywhere is expected everywhere. */
function legacyAudit(
    langs: Langs[],
    allTranslations: Partial<Record<Langs, Record<string, string>>>
): Record<string, LocaleAudit> {
    const known = new Set<string>();

    for (const lang of langs)
        for (const key of Object.keys(allTranslations[lang] ?? {})) known.add(key);

    const audits: Record<string, LocaleAudit> = {};

    for (const lang of langs) {
        const current = allTranslations[lang] ?? {};

        audits[lang] = {
            missing: [...known].filter(key => !(key in current)),
            outdated: [],
            orphan: [],
            empty: Object.keys(current).filter(key => isEmptyTranslation(current[key]))
        };
    }

    printSection(audits, 'missing', '[i18n] Missing translations:');
    printSection(audits, 'empty', '[i18n] Empty translations:');

    return audits;
}

function isEmptyTranslation(value: string | null | undefined): boolean {
    return value === '' || value === null || value === undefined;
}
