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
import { FormattedString } from "./format/FormattedString";

export default class LangData {
    public readonly lang: Langs;

    private strings: Record<string, FormattedString> = {};

    private constructor(lang: Langs) {
        this.lang = lang;
    }

    public getStrings(): Record<string, FormattedString> {
        return this.strings;
    }

    public static create(lang: Langs, data: Record<string, string>): LangData {
        if (!Object.values(Langs).includes(lang))
            throw new Error(`Invalid lang: ${lang}`);

        const instance = new LangData(lang);

        const keyParts: string[] = [];
        const parseObject = (obj: Record<string, string>) => {
            for (const [key, value] of Object.entries(obj)) {
                keyParts.push(key);
                if (typeof value === 'object') parseObject(value); else instance.strings[keyParts.join('.')] = FormattedString.create(value);
                keyParts.pop();
            }
        };
        parseObject(data);

        return instance;
    }

}
