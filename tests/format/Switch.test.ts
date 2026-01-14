import SwitchFormatter from '../../src/classes/format/SwitchFormatter';

describe('Switch', () => {

    test('new_switch', () => {
        expect(new SwitchFormatter('key', 'case1:value1|case2:value2')).toBeInstanceOf(SwitchFormatter);
    });

    test('new_switch_invalid', () => {
        expect(() => new SwitchFormatter('key', 'case1 value1')).toThrow();
    });

    test('resolve_basic', () => {
        const formatter = new SwitchFormatter('key', 'case1:value1|case2:value2');
        expect(formatter.resolve({ key: 'case1' })).toEqual('value1');
        expect(formatter.resolve({ key: 'case2' })).toEqual('value2');
    });

    test('resolve_number', () => {
        const formatter = new SwitchFormatter('key', '1:value1|2:value2');
        expect(formatter.resolve({ key: 1 })).toEqual('value1');
        expect(formatter.resolve({ key: 2 })).toEqual('value2');
    });

    test('resolve_range', () => {
        const formatter = new SwitchFormatter('key', '1!-3:value1|4-6:value2|10-inf:value3|-inf-0:value4');
        expect(formatter.resolve({ key: 1 })).toEqual('value1');
        expect(formatter.resolve({ key: 5 })).toEqual('value2');
        expect(formatter.resolve({ key: 100 })).toEqual('value3');
        expect(formatter.resolve({ key: -100 })).toEqual('value4');

        expect(() => formatter.resolve({ key: 7 })).toThrow();
    });

    test('resolve_missing', () => {
        const formatter = new SwitchFormatter('key', 'case1:value1|case2:value2');
        expect(() => formatter.resolve({})).toThrow();
    });

    test('resolve_invalid', () => {
        const formatter = new SwitchFormatter('key', 'case1:value1|case2:value2|54:value3');
        expect(() => formatter.resolve({ key: 'invalid' })).toThrow();

        expect(() => formatter.resolve({ key: 'true' })).toThrow();
    });

    test('resolve_invalid_range', () => {
        const formatter = new SwitchFormatter('key', '1!-3:value1|4-6:value2|10-inf:value3|-inf-0:value4');
        expect(() => formatter.resolve({ key: 'invalid' })).toThrow();
    });

    test('resolve_range', () => {
        const formatter = new SwitchFormatter('key', '1!-3:value1|4-6:value2|34-56!:value5|67-inf:value3|-inf-0:value4');
        expect(formatter.resolve({ key: 1 })).toEqual('value1');
        expect(formatter.resolve({ key: 5 })).toEqual('value2');
        expect(formatter.resolve({ key: 100 })).toEqual('value3');
        expect(formatter.resolve({ key: -100 })).toEqual('value4');
        expect(formatter.resolve({ key: 56 })).toEqual('value5');
    });

    test('resolve_infinite', () => {
        expect(() => new SwitchFormatter('key', '-inf-inf:value1')).toThrow();
    });

    test('resolve_unbalanced', () => {
        expect(() => new SwitchFormatter('key', '7-6:value1')).toThrow();
    });

    test('infinites_inclusive', () => {
        const formatter = new SwitchFormatter('key', '-inf-8!:value1|9!-inf:value2');
        expect(formatter.resolve({ key: -100 })).toEqual('value1');
        expect(formatter.resolve({ key: 8 })).toEqual('value1');
        expect(formatter.resolve({ key: 9 })).toEqual('value2');
        expect(formatter.resolve({ key: 100 })).toEqual('value2');
    });
});
