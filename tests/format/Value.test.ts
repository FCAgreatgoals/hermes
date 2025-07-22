import ValueFormatter from '../../src/classes/format/ValueFormatter';

describe('Value', () => {

    test('new_value', () => {
        expect(new ValueFormatter('key')).toBeInstanceOf(ValueFormatter);
    });

    test('resolve_basic', () => {
        const formatter = new ValueFormatter('key');
        expect(formatter.resolve({ key: 'value' })).toEqual('value');
        expect(formatter.resolve({ key: 1 })).toEqual('1');
        expect(formatter.resolve({ key: true })).toEqual(true);
    });

    test('resolve_missing', () => {
        const formatter = new ValueFormatter('key');
        expect(() => formatter.resolve({})).toThrow();
    });

});
