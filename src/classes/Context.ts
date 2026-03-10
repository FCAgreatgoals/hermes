/**
 * This file is part of @fca.gg/hermes (https://github.com/FCAgreatgoals/hermes).
 *
 * Copyright (C) 2026 SAS French Community Agency
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
 *
 * Additional permission under the AGPL-3.0 section 7:
 * You may use this library as a dependency in your own application without
 * your application being subject to the AGPL-3.0. Only modifications to
 * @fca.gg/hermes itself must be made publicly available. See LINKING_EXCEPTION.md
 * for full details.
 */

import { Langs } from "../constants";
import LangData from "./LangData";

export default class Context {

    private readonly data: LangData;
    private readonly basePath: string;

    public static create(data: LangData, basePath: string = '') {
        return new Context(data, basePath);
    }

    private constructor(data: LangData, basePath: string) {
        this.data = data;
        this.basePath = basePath;
    }

    public get lang(): Langs {
        return this.data.lang;
    }

    /**
     * @method translate
     * @description Translate a key to the current language with optional object to replace placeholders
     *
     * @throws if translation not found
     * @throws if values are missing for formatting
     *
     * @param key
     * @param object
     * @returns string
     */
    public translate(key: string, object?: unknown): string {
        const fullKey = this.basePath ? `${this.basePath}.${key}` : key;
        const value = this.data.getStrings()[fullKey];

        if (value)
            return value.resolve(object);

        throw new Error(`Translation not found for key: ${fullKey} in lang: ${this.data.lang}`);
    }

    /**
     * {@link translate} alias
     */
    public t(key: string, object?: Record<string, unknown>): string {
        return this.translate(key, object);
    }

}
