import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import Hermes from '../src/classes/Hermes';
import { Langs } from '../src/constants';

// Mock the config loading to avoid ES module issues in tests
jest.mock('../src/cli/HermesConfig', () => ({
    loadConfig: () => ({
        localesDir: 'locales',
        buildDir: './.hermes',
        checkTranslations: true,
        keys: 'flat',
        fallbackChains: {
            default: ['en-US', 'en-GB']
        }
    })
}));

describe('Hermes_Init_Test', () => {
    
    beforeEach(() => {
        // Reset the singleton instance before each test
        (Hermes as any).instance = null;
    });

    test('should initialize successfully with valid translations', () => {
        expect(() => Hermes.init()).not.toThrow();
        expect(Hermes.getContext('en-US')).toBeDefined();
    });

    test('should throw error when initializing twice', () => {
        Hermes.init();
        expect(() => Hermes.init()).toThrow('I18n already initialized');
    });

    test('should get context for available languages', () => {
        Hermes.init();
        const enContext = Hermes.getContext('en-US');
        const frContext = Hermes.getContext('fr');
        
        expect(enContext.lang).toBe(Langs.ENGLISH_US);
        expect(frContext.lang).toBe(Langs.FRENCH);
    });

    test('should fallback to default locale for unavailable language', () => {
        Hermes.init();
        const context = Hermes.getContext('de' as Langs); // German not available
        
        // Should fallback to default locale (en-US)
        expect(context.lang).toBe(Langs.ENGLISH_US);
    });

    test('should get localized object for existing key', () => {
        Hermes.init();
        const localizedObj = Hermes.getLocalizedObject('hello.world');
        
        expect(localizedObj).toBeDefined();
        expect(typeof localizedObj['en-US']).toBe('string');
        expect(localizedObj['en-US']).toBe('Hello World');
    });

    test('should get available languages', () => {
        Hermes.init();
        const languages = Hermes.getAvailableLanguages();
        
        expect(Array.isArray(languages)).toBe(true);
        expect(languages.length).toBeGreaterThan(0);
        expect(languages).toContain(Langs.ENGLISH_US);
    });
});
