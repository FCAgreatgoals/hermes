import PluralFormatter from '../../src/classes/format/PluralFormatter';

describe('Plural', () => {

    test('new_plural', () => {
        expect(new PluralFormatter('key', 'data|data2')).toBeInstanceOf(PluralFormatter);
    });

    test('new_plural_invalid', () => {
        expect(() => new PluralFormatter('key', 'data')).toThrow();
    });

    test('resolve_basic', () => {
        const formatter = new PluralFormatter('key', 'singular|plural');
        expect(formatter.resolve({ key: 1 })).toEqual('singular');
        expect(formatter.resolve({ key: 2 })).toEqual('plural');
        expect(formatter.resolve({ key: 0 })).toEqual('plural');
    });

    test('resolve_three', () => {
        const formatter = new PluralFormatter('key', 'singular|plural|zero');
        expect(formatter.resolve({ key: 1 })).toEqual('singular');
        expect(formatter.resolve({ key: 2 })).toEqual('plural');
        expect(formatter.resolve({ key: 0 })).toEqual('zero');
    })

    test('resolve_missing', () => {
        const formatter = new PluralFormatter('key', 'singular|plural');
        expect(() => formatter.resolve({})).toThrow();
    });

    test('resolve_invalid', () => {
        const formatter = new PluralFormatter('key', 'singular|plural');
        expect(() => formatter.resolve({ key: 'invalid' })).toThrow();
    });

});
