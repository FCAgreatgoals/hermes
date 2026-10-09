import LangData from "../src/classes/LangData";
import Context from "../src/classes/Context";
import { FormattedString } from "../src/classes/format/FormattedString";
import { Langs } from "../src/constants";

describe('RuntimeFallback_Test', () => {

    const make = () => {
        const en = LangData.create(Langs.ENGLISH_US, { 'a': 'A en', 'b': 'B %n%', 'empty': '', 'only.en': 'only en' });
        const sv = LangData.create(Langs.SWEDISH, { 'a': 'A sv' });
        const da = LangData.create(Langs.DANISH, { 'b': 'B da %n%' });
        da.setFallbacks([sv, en]);
        sv.setFallbacks([en]);
        return { en, sv, da };
    };

    test('own_then_fallbacks_in_order', () => {
        const { da } = make();
        const ctx = Context.create(da);
        expect(ctx.t('a')).toBe('A sv');
        expect(ctx.t('b', { n: 2 })).toBe('B da 2');
        expect(ctx.t('only.en')).toBe('only en');
        expect(ctx.lang).toBe(Langs.DANISH);
    });

    test('fallback_instances_are_shared', () => {
        const { en, da } = make();
        expect(Context.create(en).t('b', { n: 1 })).toBe('B 1');
        const parsed = en.get('b');
        expect(parsed).toBeInstanceOf(FormattedString);
        expect(LangData.create(Langs.DANISH, {}).get('b')).toBeUndefined();
        const fr = LangData.create(Langs.FRENCH, {});
        fr.setFallbacks([en]);
        expect(fr.get('b')).toBe(parsed);
        expect(da.get('only.en')).toBe(en.get('only.en'));
    });

    test('plain_strings_stay_strings', () => {
        const { en } = make();
        expect(en.get('a')).toBe('A en');
        expect(typeof en.get('b')).toBe('object');
    });

    test('empty_string_is_found', () => {
        const { da } = make();
        expect(Context.create(da).t('empty')).toBe('');
    });

    test('missing_key_throws', () => {
        const { da } = make();
        expect(() => Context.create(da).t('nope')).toThrow('Translation not found for key: nope in lang: da');
    });

    test('invalid_placeholder_names_key', () => {
        const en = LangData.create(Langs.ENGLISH_US, { 'bad': 'oops %n' });
        expect(() => en.get('bad')).toThrow('Invalid translation "bad" in lang en-US');
    });

    test('nested_input_is_flattened', () => {
        const en = LangData.create(Langs.ENGLISH_US, { hello: { world: 'Hi' } });
        expect(Context.create(en, 'hello').t('world')).toBe('Hi');
    });

    test('get_strings_merges_with_precedence', () => {
        const { da } = make();
        const strings = da.getStrings();
        expect(strings['a'].resolve({})).toBe('A sv');
        expect(strings['b'].resolve({ n: 3 })).toBe('B da 3');
        expect(strings['only.en'].resolve({})).toBe('only en');
    });

});
