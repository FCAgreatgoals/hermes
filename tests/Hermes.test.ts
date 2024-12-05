import { Hermes } from '../src';

describe('Hermes_Init_Test', () => {

    test('before_init', async () => {
        expect(() => Hermes.getContext('en-GB')).toThrow()
        expect(() => Hermes.getLocalizedObject('en-GB')).toThrow()
    })

    test('init_with_throw', async () => {
        await Hermes.init({
            noMissingTranslations: 'throw',
            noEmptyTranslations: 'throw'
        });
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

});
