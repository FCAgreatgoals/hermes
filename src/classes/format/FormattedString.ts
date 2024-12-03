import ConditionalFormatter from "./ConditionalFormatter";
import DateFormatter from "./DateFormatter";
import ValueFormatter from "./ValueFormatter";

export class StringFormatter {

    constructor() {}

    public resolve(object: any): string {
        return '[DEFAULT FORMATTER]'
    }

}

export class FormattedString {

    private parts: (string | StringFormatter)[] = []

    private constructor(parts: (string | StringFormatter)[]) {
        this.parts = parts
    }

    public static create(string: string): FormattedString {
        const parts: (string | StringFormatter)[] = [];
        let index = 0
        while (index < string.length) {
            const start = string.indexOf('%', index)
            if (start === -1) {
                parts.push(string.substring(index))
                break
            }
            parts.push(string.substring(index, start))
            const end = string.indexOf('%', start + 1)
            if (end === -1) {
                parts.push(string.substring(start))
                throw new Error('No closing marker found')
            }
            const expression = string.substring(start + 1, end)
            parts.push(this.parseExpression(expression))
            index = end + 1
        }

        return new FormattedString(parts)
    }

    private static parseExpression(expression: string): StringFormatter {
        const data = expression.match(/(\w+)(?::(\w+)\((.+)\))?/)
        if (!data)
            throw new Error(`Invalid expression: ${expression}`)
        if (!data[2]) {
            return new ValueFormatter(data[1])
        }
        switch (data[2]) {
            case 'date':
                return new DateFormatter(data[1], data[3])
            case 'if':
                return new ConditionalFormatter(data[1], data[3])
            case 'plural': {
                // return PluralFormatter
            }
            case 'either': {
                // return TernaryFormatter
            }
            case 'switch': {
                // return SwitchFormatter
            }
        }
        return new StringFormatter()
    }

    public resolve(object: any): string {
        let result = ''
        for (const part of this.parts) {
            if (typeof part === 'object') {
                try {
                    result += part.resolve(object)
                } catch (e: any) {
                    throw new Error(`Error resolving part: ${e.message}`)
                }
            } else {
                result += part
            }
        }
        return result
    }

}