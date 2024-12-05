import LangData from "../src/classes/LangData";

describe('LangData_Init_Test', () => {

    test('invalid_lang', async () => {
        // @ts-ignore
        expect(async () => await LangData.create('eeee', './translations/eeee')).rejects.toThrow()
    });

    test('valid_lang', async () => {
        // @ts-ignore
        const res = await LangData.create('en-US', './translations/en-US')
        expect(res).toBeDefined()
        expect(res.getStrings()).toBeDefined()
    });

    test('invalid_path', async () => {
        // @ts-ignore
        expect(async () => await LangData.create('en-US', './translations/en-US/invalid')).rejects.toThrow()
    });

    test('broken_json', async () => {
        // @ts-ignore
        expect(await LangData.create('en-US', './tests/broken.json')).toBeDefined()
    });

});
