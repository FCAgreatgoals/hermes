import DateFormatter from '../../src/classes/format/DateFormatter';

describe('Date', () => {

    test('new_date', () => {
        expect(new DateFormatter('key', 'data')).toBeInstanceOf(DateFormatter);
    });

    test('resolve_basic', () => {
        const date = new Date(2021, 0, 1);
        expect(new DateFormatter('key', 'YY-MM-DD').resolve({ key: date })).toEqual('21-01-01');
        expect(new DateFormatter('key', 'YYYY-MM-DD').resolve({ key: date })).toEqual('2021-01-01');
        expect(new DateFormatter('key', 'YY-MM-DD hh:mm:ss').resolve({ key: date })).toEqual('21-01-01 00:00:00');
        expect(new DateFormatter('key', 'no date').resolve({ key: date })).toEqual('no date');
    })

    test('resolve_missing', () => {
        const formatter = new DateFormatter('key', 'YY-MM-DD');
        expect(() => formatter.resolve({})).toThrow();
    });

    test('resolve_invalid', () => {
        const formatter = new DateFormatter('key', 'YY-MM-DD');
        expect(() => formatter.resolve({ key: 'invalid' })).toThrow();
    });

});
