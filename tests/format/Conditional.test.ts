import ConditionalFormatter from '../../src/classes/format/ConditionalFormatter';

describe('Conditional', () => {

    test('new_conditional', () => {
        expect(new ConditionalFormatter('key', 'data')).toBeInstanceOf(ConditionalFormatter);
    });

    test('resolve_true', () => {
        const formatter = new ConditionalFormatter('key', 'data');
        expect(formatter.resolve({ key: true })).toEqual('data');
        expect(formatter.resolve({ key: false })).toEqual('');
    });

    test('resolve_missing', () => {
        const formatter = new ConditionalFormatter('key', 'data');
        expect(() => formatter.resolve({})).toThrow();
    });

    test('resolve_invalid', () => {
        const formatter = new ConditionalFormatter('key', 'data');
        expect(() => formatter.resolve({ key: 'invalid' })).toThrow();
    });

});
