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
    DAY_REGEX,
    FULL_YEAR_REGEX,
    HOUR_REGEX,
    MINUTE_REGEX,
    MONTH_REGEX,
    SECOND_REGEX,
    YEAR_REGEX
} from '../../constants';

export default class DateFormatter {

    private readonly key: string;
    private readonly format: string;

    constructor(key: string, data: string) {
        this.key = key;
        this.format = data;
    }

    private formatDate(date: Date): string {
        // Format the date following the format string
        // Replace YY with the year (Last two numbers), MM with the month, and DD with the day
        // YYYY for the full year, hh for the hours, mm for the minutes, and ss for the seconds
        // D for the day of the week, M for the month name
        // Etc.
        return this.format
            .replace(FULL_YEAR_REGEX, date.getFullYear().toString())
            .replace(YEAR_REGEX, date.getFullYear().toString().slice(-2))
            .replace(MONTH_REGEX, (date.getMonth() + 1).toString().padStart(2, '0'))
            .replace(DAY_REGEX, date.getDate().toString().padStart(2, '0'))
            .replace(HOUR_REGEX, date.getHours().toString().padStart(2, '0'))
            .replace(MINUTE_REGEX, date.getMinutes().toString().padStart(2, '0'))
            .replace(SECOND_REGEX, date.getSeconds().toString().padStart(2, '0'));
    }

    public resolve(object: Record<string, unknown>): string {
        if (this.key in object && object[this.key] instanceof Date)
            return this.formatDate(object[this.key] as Date);
        throw new Error(`Missing key "${this.key}"`);
    }

}
