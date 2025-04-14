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

export default class PluralFormatter {

    private readonly key: string
    private readonly oneData: string
    private readonly pluralData: string
    private readonly zeroData: string | undefined

    constructor(key: string, data: string) {
        const parts = data.split('|')
        if (parts.length < 2)
            throw new Error(`Invalid data: ${data} (Should be "one|plural[|zero]")`)
        this.key = key
        this.oneData = parts[0]
        this.pluralData = parts[1]
        this.zeroData = parts[2]
    }

    public resolve(object: any): string {
        if (this.key in object && typeof object[this.key] === 'number') {
            if (object[this.key] === 0 && this.zeroData)
                return this.zeroData
            return object[this.key] === 1 ? this.oneData : this.pluralData
        }
        throw new Error(`Missing or invalid key "${this.key}" (should be number)`)
    }

}
