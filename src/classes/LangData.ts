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

import { Langs } from "../constants";
import { RecursiveRecord } from "../types";
import { FormattedString } from "./format/FormattedString";

/**
 * A translation as stored: the raw text until a placeholder string is first used, then its parsed
 * form. Text without placeholders never gets parsed, it resolves to itself.
 */
export type Translation = string | FormattedString;

export default class LangData {
    public readonly lang: Langs;

    private readonly strings: Map<string, Translation>;
    private fallbacks: readonly LangData[] = [];

    private constructor(lang: Langs, strings: Map<string, Translation>) {
        this.lang = lang;
        this.strings = strings;
    }

    /**
     * Holds only the strings this language owns. Anything else is looked up, in order, in the
     * languages given to {@link setFallbacks}, which share their instances instead of copying them.
     */
    public static create(lang: Langs, data: RecursiveRecord | Record<string, string>): LangData {
        if (!Object.values(Langs).includes(lang))
            throw new Error(`Invalid lang: ${lang}`);

        const strings = new Map<string, Translation>();

        const keyParts: string[] = [];
        const parseObject = (obj: RecursiveRecord) => {
            for (const key in obj) {
                const value = obj[key];
                keyParts.push(key);
                if (typeof value === 'object') parseObject(value); else strings.set(keyParts.join('.'), value);
                keyParts.pop();
            }
        };
        parseObject(data);

        return new LangData(lang, strings);
    }

    public setFallbacks(fallbacks: readonly LangData[]): void {
        this.fallbacks = fallbacks.filter(fallback => fallback !== this);
    }

    public get(key: string): Translation | undefined {
        const own = this.getOwn(key);
        if (own !== undefined) return own;

        for (const fallback of this.fallbacks) {
            const value = fallback.getOwn(key);
            if (value !== undefined) return value;
        }

        return undefined;
    }

    public resolve(key: string, object?: unknown): string | undefined {
        const value = this.get(key);
        if (value === undefined || typeof value === 'string') return value;
        return value.resolve(object);
    }

    private getOwn(key: string): Translation | undefined {
        const value = this.strings.get(key);
        if (typeof value !== 'string' || !value.includes('%')) return value;

        let parsed: FormattedString;
        try {
            parsed = FormattedString.create(value);
        } catch (e) {
            throw new Error(`Invalid translation "${key}" in lang ${this.lang}: ${(e as Error).message}`);
        }
        this.strings.set(key, parsed);
        return parsed;
    }

    /**
     * @deprecated Builds a full copy on every call, fallbacks included: use {@link get} instead.
     */
    public getStrings(): Record<string, FormattedString> {
        const result: Record<string, FormattedString> = {};

        for (const data of [...this.fallbacks].reverse().concat(this)) {
            for (const [key, value] of data.strings)
                result[key] = typeof value === 'string' ? FormattedString.create(value) : value;
        }

        return result;
    }

}
