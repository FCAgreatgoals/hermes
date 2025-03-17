import LangData from "./LangData";

export default class Context {

    private readonly data: LangData
    private readonly basePath: string

    public static create(data: LangData, basePath: string = '') {
        return new Context(data, basePath)
    }

    private constructor(data: LangData, basePath: string) {
        this.data = data
        this.basePath = basePath
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
    public translate(key: string, object?: any):string {
        const value = this.data.getStrings()[(this.basePath !== '') ? `${this.basePath}.${key}`: key]
        if (!value)
            throw new Error(`Translation not found for key: ${(this.basePath !== '') ? `${this.basePath}.${key}` : key} in lang: ${this.data.lang}`)
        return value.resolve(object)
    }

    public t = this.translate

}
