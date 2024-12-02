import { readFile, readdir, stat } from "fs/promises";
import { Langs } from "../types/Langs";

export default class LangData {
    public readonly lang: Langs

    private strings: Record<string, string> = {}

    private constructor(lang: Langs) {
        this.lang = lang
    }

    private async parseFile(path: string, baseKey?: string) {
        const buffer = await readFile(path, 'utf8')
        let obj: Record<string, any>
        try {
            obj = JSON.parse(buffer)
        } catch (_) { return };
        if (!obj) return

        const keyParts: string[] = []
        if (baseKey) keyParts.push(baseKey)
        const parseObject = (obj: Record<string, any>) => {
            for (const [key, value] of Object.entries(obj)) {
                keyParts.push(key)
                if (typeof value === 'object') parseObject(value); else this.strings[keyParts.join('.')] = value
                keyParts.pop()
            }
        }
        parseObject(obj)

    }

    public getStrings() {
        return this.strings
    }

    private async parseDir(path: string, baseKey?: string) {
        const files = await readdir(path)

        for (const file of files) {
            const filePath = `${path}/${file}`
            const stats = await stat(filePath)
            if (stats.isDirectory())
                await this.parseDir(filePath,
                    baseKey
                        ? `${baseKey}.${file.replace('.json', '')}`
                        : file.replace(/\.json$/, '')
                    );
            else if (file.endsWith('.json'))
                await this.parseFile(filePath, baseKey
                            ? `${baseKey}.${file.replace('.json', '')}`
                            : file.replace(/\.json$/, '')
                        );
        }
    }

    public static async create(lang: Langs, path: string) {
        if (!Object.values(Langs).includes(lang))
            throw new Error(`Invalid lang: ${lang}`)

        const instance = new LangData(lang)

        if (path.endsWith('.json'))
            await instance.parseFile(path);
        else await instance.parseDir(path);

        return instance
    }

}
