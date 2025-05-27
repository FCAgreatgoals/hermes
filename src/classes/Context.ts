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

import LangData from "./LangData";

export default class Context {

    private readonly data: LangData
    private readonly basePath: string
    private readonly fallbackData?: LangData

    public static create(data: LangData, basePath: string = '', fallbackData?: LangData) {
        return new Context(data, basePath, fallbackData)
    }

    private constructor(data: LangData, basePath: string, fallbackData?: LangData) {
        this.data = data
        this.basePath = basePath
        this.fallbackData = fallbackData
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
    public translate(key: string, object?: any): string {
        const fullKey = this.basePath ? `${this.basePath}.${key}` : key
        const value = this.data.getStrings()[fullKey]

        if (value)
            return value.resolve(object)

        if (this.fallbackData) {
            const fallbackValue = this.fallbackData.getStrings()[fullKey]

            if (fallbackValue)
                return fallbackValue.resolve(object)
        }

        throw new Error(`Translation not found for key: ${fullKey} in lang: ${this.data.lang}`)
    }

    /**
     * {@link translate} alias
     */
    public t(key: string, object?: any): string {
        return this.translate(key, object)
    }

}
