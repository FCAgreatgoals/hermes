import Context from "../src/classes/Context";
import LangData from "../src/classes/LangData";
import { Langs } from "../src/constants";
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

    test('should check if translation key exists', () => {
        const translations = JSON.parse(readFileSync('./.hermes/translations.json', 'utf-8'));
        const data = LangData.create(Langs.ENGLISH_US, translations[Langs.ENGLISH_US]);
        const ctx = Context.create(data);
        
        expect(ctx.has('hello.world')).toBe(true);
        expect(ctx.has('test.nested.key')).toBe(true);
        expect(ctx.has('nonexistent')).toBe(false);
    });

    test('should check if translation key exists with base path', () => {
        const translations = JSON.parse(readFileSync('./.hermes/translations.json', 'utf-8'));
        const data = LangData.create(Langs.ENGLISH_US, translations[Langs.ENGLISH_US]);
        const ctx = Context.create(data, 'hello');
        
        expect(ctx.has('world')).toBe(true);
        expect(ctx.has('nonexistent')).toBe(false);
    });

});
