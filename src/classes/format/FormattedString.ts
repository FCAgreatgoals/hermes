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

import ConditionalFormatter from "./ConditionalFormatter";
import DateFormatter from "./DateFormatter";
import ValueFormatter from "./ValueFormatter";
import TernaryFormatter from "./TernaryFormatter";
import PluralFormatter from "./PluralFormatter";
import SwitchFormatter from "./SwitchFormatter";

export class StringFormatter {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public resolve(object: unknown): string {
        return '[DEFAULT FORMATTER]';
    }

}

export class FormattedString {

    private parts: (string | StringFormatter)[] = [];

    private constructor(parts: (string | StringFormatter)[]) {
        this.parts = parts;
    }

    public static create(string: string): FormattedString {
        const parts: (string | StringFormatter)[] = [];
        let index = 0;
        while (index < string.length) {
            const start = string.indexOf('%', index);
            if (start === -1) {
                parts.push(string.substring(index));
                break;
            }
            parts.push(string.substring(index, start));
            if (string[start - 1] === '\\') {
                parts[parts.length - 1] = (<string>parts[parts.length - 1]).slice(0, -1);
                parts.push('%');
                index = start + 1;
                continue;
            }
            let end = string.indexOf('%', start + 1);
            while (end !== -1 && string[end - 1] === '\\') {
                string = string.slice(0, end - 1) + string.slice(end);
                end = string.indexOf('%', end + 1);
            }
            if (end === -1) {
                parts.push(string.substring(start));
                throw new Error('No closing marker found');
            }
            const expression = string.substring(start + 1, end);
            parts.push(this.parseExpression(expression));
            index = end + 1;
        }

        return new FormattedString(parts);
    }

    private static parseExpression(expression: string): StringFormatter {
        const data = expression.match(/^(\w+)(?::(\w+)\((.+)\))?$/);
        if (!data)
            throw new Error(`Invalid expression: ${expression}`);
        if (!data[2]) {
            return new ValueFormatter(data[1]);
        }
        switch (data[2]) {
            case 'date':
                return new DateFormatter(data[1], data[3]);
            case 'if':
                return new ConditionalFormatter(data[1], data[3]);
            case 'plural':
                return new PluralFormatter(data[1], data[3]);
            case 'either':
                return new TernaryFormatter(data[1], data[3]);
            case 'switch':
                return new SwitchFormatter(data[1], data[3]);
        }
        return new StringFormatter();
    }

    public isEmpty(): boolean {
        return (this.parts.length <= 1 && (this.parts[0] === undefined || this.parts[0] === ''));
    }

    public resolve(object: unknown): string {
        let result = '';
        if (this.parts.length > 1 && object === undefined)
            throw new Error('An object is required to resolve the string');
        for (const part of this.parts) {
            if (typeof part === 'object') {
                try {
                    result += part.resolve(object);
                } catch (e) {
                    throw new Error(`Error resolving part: ${(e as Error).message}`);
                }
            } else {
                result += part;
            }
        }
        return result;
    }

}
