import LangData from "../src/classes/LangData";

describe('LangData_Init_Test', () => {

    test('invalid_lang', () => {
        // @ts-expect-error testing
        expect(async () => await LangData.create('eeee', './translations/eeee')).rejects.toThrow();
    });

    test('valid_lang', async () => {
        // @ts-expect-error testing
        const res = await LangData.create('en-US', './translations/en-US');
        expect(res).toBeDefined();
        expect(res.getStrings()).toBeDefined();
    });

    test('invalid_path', () => {
        // @ts-expect-error testing
        expect(async () => await LangData.create('en-US', './translations/en-US/invalid')).rejects.toThrow();
    });

    test('broken_json', async () => {
        // @ts-expect-error testing
        expect(await LangData.create('en-US', './tests/broken.json')).toBeDefined();
    });

});
