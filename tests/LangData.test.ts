import LangData from "../src/classes/LangData";
import { Langs } from "../src/types";
import { readFileSync } from "fs";

describe('LangData_Init_Test', () => {

    test('invalid_lang', () => {
        const data = { "test": "value" };
        // @ts-expect-error testing invalid lang
        expect(() => LangData.create('eeee', data)).toThrow('Invalid lang: eeee');
    });

    test('valid_lang', () => {
        const translations = JSON.parse(readFileSync('./.hermes/translations.json', 'utf-8'));
        const res = LangData.create(Langs.ENGLISH_US, translations[Langs.ENGLISH_US]);
        expect(res).toBeDefined();
        expect(res.getStrings()).toBeDefined();
    });

    test('invalid_path', () => {
        expect(() => {
            readFileSync('./translations/en-US/invalid', 'utf-8');
        }).toThrow();
    });

    test('broken_json', () => {
        const jsonContent = readFileSync('./tests/broken.json', 'utf-8');
        expect(() => JSON.parse(jsonContent)).toThrow();
    });

});
