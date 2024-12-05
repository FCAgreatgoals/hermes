import Context from "../src/classes/Context";
import LangData from "../src/classes/LangData";

describe('Context_Init_Test', () => {

    test('base_test', async () => {
        // @ts-ignore
        const data = await LangData.create('en-US', './translations')

        const ctx = Context.create(data)
        expect(ctx).toBeDefined()
    })

    test('get_string', async () => {
        // @ts-ignore
        const data = await LangData.create('en-US', './translations/en-US')

        const ctx = Context.create(data)
        expect(ctx.t('hello.world')).toBeDefined()
    })

    test('get_invalid_string', async () => {
        // @ts-ignore
        const data = await LangData.create('en-US', './translations/en-US')

        const ctx = Context.create(data)
        expect(() => ctx.t('hello.test')).toThrow()
    })

    test('context_with_basepath', async () => {
        // @ts-ignore
        const data = await LangData.create('en-US', './translations/en-US')

        const ctx = Context.create(data, 'hello')
        expect(ctx.t('world')).toBeDefined()
    })

    test('context_with_basepath_invalid', async () => {
        // @ts-ignore
        const data = await LangData.create('en-US', './translations/en-US')

        const ctx = Context.create(data, 'hello')
        expect(() => ctx.t('test')).toThrow()
    });

});
