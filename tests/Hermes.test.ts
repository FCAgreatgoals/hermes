import { Hermes } from '../src';

describe('Hermes_Init_Test', () => {

    test('before_init', async () => {
        expect(() => Hermes.getContext('en-GB')).toThrow()
        expect(() => Hermes.getLocalizedObject('en-GB')).toThrow()
    })

    test('init_with_throw', async () => {
        // @ts-ignore
        Hermes.instance = undefined;
        await Hermes.init({
            noMissingTranslations: 'throw',
            noEmptyTranslations: 'throw'
        });
    })

    test('init_already_initialized', async () => {
        // expect a second init to throw
        await expect(Hermes.init({})).rejects.toThrow();
    })

    test('init_with_undefined', async () => {
        // @ts-ignore
        Hermes.instance = undefined;
        await Hermes.init(undefined);
    })

    test('init_with_empty_params', async () => {
        // @ts-ignore
        Hermes.instance = undefined;
        await Hermes.init({});
    })

    test('get_context', async () => {
        const ctx = Hermes.getContext('en-GB')
        expect(ctx).toBeDefined()
    })

    test('get_invalid_context', async () => {
        expect(() => Hermes.getContext('it')).toThrow()
    })

    test('get_localized_object', async () => {
        const obj = Hermes.getLocalizedObject('hello.world')
        expect(obj).toBeDefined()
    })

    test('get_invalid_localized_object', async () => {
        expect(() => Hermes.getLocalizedObject('hello.test')).toThrow()
    })

    test('init_purposefully_invalid_dir_throw', async () => {
        // @ts-ignore
        Hermes.instance = undefined;
        jest.spyOn(console, 'error').mockImplementation(() => { });
        await expect(() => Hermes.init({
            translationDir: './tests/badTranslations',
            noMissingTranslations: 'throw',
            noEmptyTranslations: 'throw'
        })).rejects.toThrow();
    })

    test('init_purposefully_invalid_dir_warn', async () => {
        // @ts-ignore
        Hermes.instance = undefined;
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        await Hermes.init({
            translationDir: './tests/badTranslations',
            noMissingTranslations: 'warn',
            noEmptyTranslations: 'warn'
        });
    })

    test('init_purposefully_invalid_dir_ignore', async () => {
        // @ts-ignore
        Hermes.instance = undefined;
        await Hermes.init({
            translationDir: './tests/badTranslations',
            noMissingTranslations: 'ignore',
            noEmptyTranslations: 'ignore'
        });
    })

    test('init_purposefully_invalid_dir_default', async () => {
        // @ts-ignore
        Hermes.instance = undefined;
        jest.spyOn(console, 'log').mockImplementation(() => { });
        await Hermes.init({
            translationDir: './tests/badTranslations',
            // @ts-ignore
            noEmptyTranslations: 'default',
            // @ts-ignore
            noMissingTranslations: 'default'
        });
    })

    test('init_purposefully_invalid_dir_extreme', async () => {
        /* @ts-ignore */
        Hermes.instance = undefined;
        await expect(() => Hermes.init({
            translationDir: './tests/badTranslations',
            noMissingTranslations: 'ignore',
            noEmptyTranslations: 'throw'
        })).rejects.toThrow();
    })

    test('fallback_not_defined', async () => {
        expect(() => Hermes.getContext('id')).toThrow() // should throw because fallback is not defined
    })

    test('fallback_defined', async () => {
        // @ts-ignore
        Hermes.instance = undefined;
        await Hermes.init({
            fallbackLang: 'en-GB'
        })
        expect(Hermes.getContext('id')).toBeDefined()
    })

    test('fallback_defined_invalid', async () => {
        // @ts-ignore
        Hermes.instance = undefined;
        await Hermes.init({
            fallbackLang: 'id'
        })
        expect(() => Hermes.getContext('it')).toThrow()
    })

});
