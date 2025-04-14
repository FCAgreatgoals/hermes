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

import { readFile, readdir, stat } from "fs/promises";
import { Langs } from "../types/Langs";
import { FormattedString } from "./format/FormattedString";
import JSON5 from 'json5'

export default class LangData {
    public readonly lang: Langs

    private strings: Record<string, FormattedString> = {}

    private constructor(lang: Langs) {
        this.lang = lang
    }

    private async parseFile(path: string, baseKey?: string) {
        const buffer = await readFile(path, 'utf8')
        let obj: Record<string, any>
        try {
            obj = JSON5.parse(buffer)
        } catch (_) { return }

        const keyParts: string[] = []
        if (baseKey) keyParts.push(baseKey)
        const parseObject = (obj: Record<string, any>) => {
            for (const [key, value] of Object.entries(obj)) {
                keyParts.push(key)
                if (typeof value === 'object') parseObject(value); else this.strings[keyParts.join('.')] = FormattedString.create(value)
                keyParts.pop()
            }
        }
        parseObject(obj)

    }

    public getStrings(): Record<string, FormattedString> {
        return this.strings
    }

    private async parseDir(path: string, baseKey?: string): Promise<void> {
        const files = await readdir(path)
            .catch(() => { throw new Error(`Invalid path: ${path}`) })

        for (const file of files) {
            const filePath = `${path}/${file}`
            const stats = await stat(filePath)
            if (stats.isDirectory())
                await this.parseDir(filePath,
                    baseKey
                        ? `${baseKey}.${file.replace(/\.(json|json5)$/, '')}`
                        : file.replace(/\.(json|json5)$/, '')
                    );
            else if (file.endsWith('.json') || file.endsWith('.json5'))
                await this.parseFile(filePath,
                    baseKey
                        ? `${baseKey}.${file.replace(/\.(json|json5)$/, '')}`
                        : file.replace(/\.(json|json5)$/, '')
                    );
        }
    }

    public static async create(lang: Langs, path: string): Promise<LangData> {
        if (!Object.values(Langs).includes(lang))
            throw new Error(`Invalid lang: ${lang}`)

        const instance = new LangData(lang)

        if (path.endsWith('.json') || path.endsWith('.json5'))
            await instance.parseFile(path);
        else await instance.parseDir(path);

        return instance
    }

}
