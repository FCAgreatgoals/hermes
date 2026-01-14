import { FormattedString } from "../src/classes/format/FormattedString";

describe('FormattedString_Init_Test', () => {

    test('create_basic', () => {
        expect(FormattedString.create('Hello')).toBeDefined();
        expect(FormattedString.create('Hello').resolve({})).toEqual('Hello');
    });

    test('create_with_args', () => {
        expect(FormattedString.create('Hello %name%').resolve({name: 'World'})).toEqual('Hello World');
    });

    test('missing_args', () => {
        expect(() => FormattedString.create('Hello %name%').resolve({})).toThrow();
    });

    test('test_expressions', () => {
        expect(FormattedString.create('Hello %boolValue:if(false)%').resolve({ boolValue: false })).toBe('Hello ');
        expect(FormattedString.create('Hello %boolValue:if(true)%').resolve({ boolValue: true })).toBe('Hello true');
        expect(FormattedString.create("Hello %date:date(YYYY)%").resolve({
            date: new Date('2021-01-01')
        })).toBe('Hello 2021');
        expect(FormattedString.create("Hello %count:plural(test|test2|test3)%").resolve({count: 1})).toBe('Hello test');
        expect(FormattedString.create("Hello %count:plural(test|test2|test3)%").resolve({count: 2})).toBe('Hello test2');
        expect(FormattedString.create("Hello %count:plural(test|test2|test3)%").resolve({count: 0})).toBe('Hello test3');
        expect(FormattedString.create("Hello %count:plural(test|test2|test3)%").resolve({count: 3})).toBe('Hello test2');
        expect(FormattedString.create("Hello %boolValue:either(text|other text)%").resolve({boolValue: true})).toBe('Hello text');
        expect(FormattedString.create("Hello %boolValue:either(text|other text)%").resolve({boolValue: false})).toBe('Hello other text');
        expect(FormattedString.create("Hello %value:switch(text value:This is a text value)%").resolve({value: 'text value'})).toBe('Hello This is a text value');
        expect(FormattedString.create("Hello %value:switch(45:fourty-five)%").resolve({value: 45})).toBe('Hello fourty-five');
        expect(FormattedString.create("Hello %value:switch(45-56:fourty-five)%").resolve({value: 46})).toBe('Hello fourty-five');
    });

    test('unmatched_percent', () => {
        expect(() => FormattedString.create('Hello %name')).toThrow();
    });

    test('invalid_expression', () => {
        expect(() => FormattedString.create('Hello %name:invalid%')).toThrow();
    });

    test('unimplemented_expression', () => {
        expect(FormattedString.create('Hello %name:invalid(data)%').resolve({})).toEqual('Hello [DEFAULT FORMATTER]');
    });

    test('required_not_provided', () => {
        expect(() => FormattedString.create('Hello %name%').resolve(undefined)).toThrow();
    });

    test('escaped_percent_both', () => {
        expect(FormattedString.create('Hello \\%name\\%').resolve({})).toEqual('Hello %name%');
    });

    test('escaped_percent_start', () => {
        expect(() => FormattedString.create('Hello \\%name%').resolve({})).toThrow();
    });

    test('escaped_percent_end', () => {
        expect(() => FormattedString.create('Hello %name\\%').resolve({})).toThrow();
    });

    test('regular_sentence_with_percent', () => {
        expect(FormattedString.create('There is 100\\% coverage!').resolve({})).toEqual('There is 100% coverage!');
    });

    test('escaped_percent_inside_expression', () => {
        expect(FormattedString.create('Hello %name:if(100\\%)%').resolve({name: true})).toEqual('Hello 100%');
    });

});
