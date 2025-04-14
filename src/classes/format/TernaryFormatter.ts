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

export default class TernaryFormatter {

    private readonly key: string
    private readonly thenData: string
    private readonly elseData: string

    constructor(key: string, data: string) {
        const parts = data.split('|')
        if (parts.length !== 2)
            throw new Error(`Invalid data: ${data} (Should be "then|else")`)
        this.key = key
        this.thenData = parts[0]
        this.elseData = parts[1]
    }

    public resolve(object: any): string {
        if (this.key in object && typeof object[this.key] === 'boolean')
            return object[this.key] ? this.thenData : this.elseData
        throw new Error(`Missing or invalid key "${this.key}" (should be boolean)`)
    }

}
