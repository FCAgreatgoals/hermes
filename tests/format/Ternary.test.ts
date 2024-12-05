import TernaryFormatter from '../../src/classes/format/TernaryFormatter';

describe('Ternary', () => {

    test('new_ternary', () => {
        expect(new TernaryFormatter('key', 'true_value|false_value')).toBeInstanceOf(TernaryFormatter);
    });

    test('new_ternary_invalid', () => {
        expect(() => new TernaryFormatter('key', 'true_value')).toThrow();
    });

    test('resolve_true', () => {
        const formatter = new TernaryFormatter('key', 'true_value|false_value');
        expect(formatter.resolve({ key: true })).toEqual('true_value');
    });

    test('resolve_false', () => {
        const formatter = new TernaryFormatter('key', 'true_value|false_value');
        expect(formatter.resolve({ key: false })).toEqual('false_value');
    });

    test('resolve_missing', () => {
        const formatter = new TernaryFormatter('key', 'true_value|false_value');
        expect(() => formatter.resolve({})).toThrow();
    });

    test('resolve_invalid', () => {
        const formatter = new TernaryFormatter('key', 'true_value|false_value');
        expect(() => formatter.resolve({ key: 'invalid' })).toThrow();
    });

});
