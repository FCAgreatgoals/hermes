import { buildTranslations } from "../src/cli/commands/build";
import { DEFAULT_CONFIG, HermesConfig } from "../src/cli/HermesConfig";
import * as utils from "../src/cli/utils";

describe('BuildTranslations_Test', () => {

    const raw: Record<string, Record<string, string>> = {
        'en-US': { a: 'A', b: 'B', c: 'C' },
        'en-GB': { a: 'A', b: 'B' },
        'sv-SE': { a: 'A sv' },
        'da': { a: 'A sv', b: 'B da' },
        'fr': { a: 'A fr', b: 'B', c: 'C fr', x: 'bad %n' }
    };
    const config: HermesConfig = { ...DEFAULT_CONFIG };

    beforeEach(() => {
        jest.spyOn(utils, 'loadTranslationsRaw').mockImplementation(locale => ({ ...(raw[locale] ?? {}) }));
    });
    afterEach(() => jest.restoreAllMocks());

    const resolve = (built: ReturnType<typeof buildTranslations>, locale: string, key: string): string | undefined => {
        const entry = built.langs[locale];
        if (typeof entry === 'string') return resolve(built, entry, key);
        if (key in entry.strings) return entry.strings[key];
        for (const fallback of entry.fallbacks) {
            const fb = built.langs[fallback];
            if (typeof fb !== 'string' && key in fb.strings) return fb.strings[key];
        }
        return undefined;
    };

    test('drops_what_fallbacks_already_give', () => {
        const ok = { ...raw, fr: { a: 'A fr', b: 'B', c: 'C fr' } };
        jest.spyOn(utils, 'loadTranslationsRaw').mockImplementation(locale => ({ ...(ok[locale] ?? {}) }));
        const built = buildTranslations(Object.keys(ok), ok, {}, config);

        const gb = built.langs['en-GB'];
        const da = built.langs['da'];
        const fr = built.langs['fr'];
        if (typeof gb === 'string' || typeof da === 'string' || typeof fr === 'string') throw new Error('unexpected alias');

        expect(gb.strings).toEqual({});
        const sv = built.langs['sv-SE'];
        if (typeof sv === 'string') throw new Error('unexpected alias');
        expect(da.strings.b).toBe('B da');
        expect([sv.strings.a, da.strings.a].filter(Boolean)).toEqual(['A sv']);
        expect(fr.strings).toEqual({ a: 'A fr', c: 'C fr' });

        for (const locale of Object.keys(ok)) {
            const expected = utils.loadTranslations(locale, config);
            for (const [key, value] of Object.entries(expected)) expect(resolve(built, locale, key)).toBe(value);
        }
    });

    test('rejects_invalid_placeholders', () => {
        expect(() => buildTranslations(Object.keys(raw), raw, {}, config)).toThrow('fr x: No closing marker found');
    });

    test('keeps_aliases', () => {
        const ok = { 'en-US': { a: 'A' } };
        jest.spyOn(utils, 'loadTranslationsRaw').mockImplementation(locale => ({ ...(ok[locale as 'en-US'] ?? {}) }));
        const built = buildTranslations(['en-US', 'en-GB'], ok, { 'en-GB': 'en-US' }, config);
        expect(built.langs['en-GB']).toBe('en-US');
    });

});
