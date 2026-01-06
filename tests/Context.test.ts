import Context from "../src/classes/Context";
import LangData from "../src/classes/LangData";
import { Langs } from "../src/types";
import { readFileSync } from "fs";

describe('Context_Init_Test', () => {

    test('base_test', () => {
        const translations = JSON.parse(readFileSync('./.hermes/translations.json', 'utf-8'));
        const data = LangData.create(Langs.ENGLISH_US, translations[Langs.ENGLISH_US]);

        const ctx = Context.create(data);
        expect(ctx).toBeDefined();
    });

    test('get_string', () => {
        const translations = JSON.parse(readFileSync('./.hermes/translations.json', 'utf-8'));
        const data = LangData.create(Langs.ENGLISH_US, translations[Langs.ENGLISH_US]);

        const ctx = Context.create(data);
        expect(ctx.t('hello.world')).toBeDefined();
    });

    test('get_invalid_string', () => {
        const translations = JSON.parse(readFileSync('./.hermes/translations.json', 'utf-8'));
        const data = LangData.create(Langs.ENGLISH_US, translations[Langs.ENGLISH_US]);

        const ctx = Context.create(data);
        expect(() => ctx.t('hello.test')).toThrow();
    });

    test('context_with_basepath', () => {
        const translations = JSON.parse(readFileSync('./.hermes/translations.json', 'utf-8'));
        const data = LangData.create(Langs.ENGLISH_US, translations[Langs.ENGLISH_US]);

        const ctx = Context.create(data, 'hello');
        expect(ctx.t('world')).toBeDefined();
    });

    test('context_with_basepath_invalid', () => {
        const translations = JSON.parse(readFileSync('./.hermes/translations.json', 'utf-8'));
        const data = LangData.create(Langs.ENGLISH_US, translations[Langs.ENGLISH_US]);

        const ctx = Context.create(data, 'hello');
        expect(() => ctx.t('test')).toThrow();
    });

});
