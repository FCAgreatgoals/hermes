# Hermes

Hermes is a lightweight and simple to use package for managing i18n strings for Node.js applications. It is designed to be modular and flexible, allowing you to split your translations into multiple files and directories, and to use a simple formatting syntax to insert variables into your strings.

## Installation

To install Hermes with npm, run:
```bash
npm install "@fca.gg/hermes"
```

### Local usage
Clone the repository and run the following command to install the dependencies:
```bash
npm install
```

### Testing
To run the tests, use the following command:
```bash
npm run test
```

## Building Translations

Before using Hermes in your application, you **must** build your translations. The build process compiles all translation files into a single optimized `translations.json` file that Hermes reads at runtime.

### Build Command

```bash
npx hermes build
```

Or add it to your `package.json` scripts:
```json
{
  "scripts": {
    "build:i18n": "hermes build"
  }
}
```

### What Happens During Build

The build command:

1. **Scans your locales directory** (default: `./locales`) for translation files
2. **Merges nested files** - Combines all JSON files (both root-level and nested directories) into flat translation objects
3. **Applies fallback chains** - Automatically fills missing translations using configured fallback languages
4. **Validates translations** - Checks for missing or empty translations (if `checkTranslations` is enabled)
5. **Outputs a single file** - Creates `.hermes/translations.json` containing all languages in one optimized bundle

The output file structure:
```json
{
  "en-US": {
    "key1": "value1",
    "nested.key2": "value2"
  },
  "fr": {
    "key1": "valeur1",
    "nested.key2": "valeur2"
  }
}
```

### Configuration

Create a `hermes.config.js` file in your project root to customize the build:

```javascript
export default {
  localesDir: 'locales',           // Source directory for translation files
  buildDir: './.hermes',           // Output directory for built translations
  checkTranslations: true,         // Validate translations during build
  keys: 'flat',                    // Key format: 'flat' (dot notation), 'path' (/), or 'namespaced' (:)
  fallbackChains: {
    'en-GB': ['en-US', 'fr'],
    'es-419': ['es-ES'],
    'default': ['en-US', 'en-GB']  // Default fallback chain
  }
};
```

> [!IMPORTANT]
> The build step is **required** before running your application. When you call `Hermes.init()`, it automatically reads the pre-built `translations.json` file from the build directory for optimal performance.

## Usage

### Initialization
In order to use Hermes, you will need to create a new directory to store your translations. Inside this directory, you can create as many JSON files as you like, each representing a different language. For example, you might have the following directory structure:

```
locales/
  en-US.json
  fr.json
  de.json
```

> [!NOTE]
> Hermes supports JSON5 parsing. This means you can use comments, trailing commas, and other features that are not supported in standard JSON.
> You can use the JSON5 syntax out of the box in any `.json` files, but for standards it is recommended to use the `.json5` extension when using the more recent syntax.

For languages list:
<details>
    <sumary><i>Click here to develop</i></summary>

```typescript
export enum Langs {
    INDONESIAN = 'id',
    DANISH = 'da',
    GERMAN = 'de',
    ENGLISH_UK = 'en-GB',
    ENGLISH_US = 'en-US',
    SPANISH = 'es-ES',
    SPANISH_LATAM = 'es-419',
    FRENCH = 'fr',
    CROATIAN = 'hr',
    ITALIAN = 'it',
    LITHUANIAN = 'lt',
    HUNGARIAN = 'hu',
    DUTCH = 'nl',
    NORWEGIAN = 'no',
    POLISH = 'pl',
    BRAZILIAN_PORTUGUESE = 'pt-BR',
    ROMANIAN = 'ro',
    FINNISH = 'fi',
    SWEDISH = 'sv-SE',
    VIETNAMESE = 'vi',
    TURKISH = 'tr',
    CZECH = 'cs',
    GREEK = 'el',
    BULGARIAN = 'bg',
    RUSSIAN = 'ru',
    UKRAINIAN = 'uk',
    HINDI = 'hi',
    THAI = 'th',
    CHINESE_CHINA = 'zh-CN',
    JAPANESE = 'ja',
    CHINESE_TAIWAN = 'zh-TW',
    KOREAN = 'ko'
}
```
</details>

Each of these files should contain a JSON object with key-value pairs representing the translations for that language. For example, the contents of `en-US.json` might look like this:

```json5
{
  "hello": "Hello World!",
  // You can also nest objects
  "nested": {
    "key": "This is a nested key"
  }
}
```

To initialize Hermes, you will need to import the `Hermes` class and call the `init()` method. This method can take an optional configuration object with the following properties:
- `translationDir`: The path to the directory containing your built translations. Defaults to `./.hermes`.
- `defaultLocale`: The default language to use when requesting translations for 'default'. Defaults to `en-US`.

```typescript
import Hermes from '@fca.gg/hermes';

Hermes.init(); // Uses default options

// Or with custom options:
Hermes.init({
  translationDir: './.hermes',
  defaultLocale: Langs.ENGLISH_US
});
```

> [!NOTE]
> `Hermes.init()` reads the pre-built `translations.json` file from the specified directory. Make sure you've run `hermes build` before initializing.

### Context
In order to get a translation, you need to fetch the specific context of a language. For example, if you want to get the translation for the `greeting` key in the `en-US` context, you would do the following:
```typescript
import Hermes from '@fca.gg/hermes';

const ctx = Hermes.getContext('en-US');
ctx.t('hello'); // returns "Hello World!"

// You can also get nested keys by using dot notation
ctx.t('nested.key'); // returns "This is a nested key"

```

> [!WARNING]
> If you try to access a key that does not exist, Hermes will throw an error. Therefore, ensure that all keys are present in all translation files.
> By default warnings are logged if a key is missing on init, but you can change this behavior by setting the `noMissingTranslations` option in the `init()` method.

### Variables
When defining your translations, you can include variables and expressions inside your string by wrapping them in `%`.
For example, you might have the following translation:
```json
{
  "greeting": "Hello, %name%!",
  "condition": "It is %temp% degrees outside. %isHot:if(Wow that's hot...)%"
}
```

You can then pass an object with the variables you want to replace in the `t` method:
```typescript
import Hermes from '@fca.gg/hermes';

const ctx = Hermes.getContext('en-US');
ctx.t('greeting', { name: 'Alice' }); // returns "Hello, Alice!"
ctx.t('condition', { temp: 30, isHot: true }); // returns "It is 30 degrees outside. Wow that's hot..."
// (We're using celcius here)
```

### Expressions

You can extend the functionality of variables by using expressions. A conditional expression was used in the previous example, but you can also use expressions to format dates, numbers, and more:
- `%boolValue:if(text)%`: If `boolValue` is true, include `text` in the output. Otherwise, ignore it.
- `%boolValue:either(text|other text)%`: If `boolValue` is true, include `text` in the output. Otherwise, include `other text`.
- `%dateValue:date(YY-MM-DD)%`: Format `dateValue` as a date using the specified format. You can use any valid date format string.
  - `YY`: 2-digit year
  - `MM`: 2-digit month
  - `DD`: 2-digit day
  - `YYYY`: 4-digit year
  - `hh`: 2-digit hour
  - `mm`: 2-digit minute
  - `ss`: 2-digit second
- `%value:plural(one|plural|zero)%`: Handle pluralization based on a numeric value. The third parameter (zero) is optional.
  - `%count:plural(item|items)%`: Returns "item" if count is 1, "items" otherwise.
  - `%count:plural(item|items|no items)%`: Returns "item" if count is 1, "items" if count > 1, "no items" if count is 0.
  - Example: `"You have %count% %count:plural(message|messages|no messages)%"`
- `%value:switch(case:value)%`: Switch on the value of `value` and return the corresponding case. You can specify multiple cases separated by `|`.
  - `%value:switch(text value:This is a text value)`: If value is *"text value"*, return *"This is a text value"*.
  - `%value:switch(45:The value is 45)%`: If value is *45*, return *"The value is 45"*.
  - `%value:switch(45-60:The value is between 45 and 60)%`: If value is between *45* and *60* (exclusive), return *"The value is between 45 and 60"*. You can also put `-inf` or `inf` to match all values below or above a certain value. Inputting a `!` after a number will include that number in the range. For example, `45-60!` will include all numbers between 45 and 60, including 60.

## Scope
You can also define a scope for your translations by specifying it in the `getContext()` method. This allows you to group your translations by a specific context, such as a module or component name. For example:
```typescript
import Hermes from '@fca.gg/hermes';

const ctx = Hermes.getContext('en-US', 'nested');
ctx.t('key'); // returns "This is a nested key"
```

### Nesting files
You can also nest files in directories to group your translations. For example, you might have the following directory structure:
```
locales/
  en-US.json
  fr.json
  en-GB/
    common.json
    auth.json
    features/
      feature1.json
      feature2.json
```

When you run `hermes build`, all these files are merged into a single flat structure. You can then access keys in the nested files using dot notation (or the separator defined in your config):
```typescript
import Hermes from '@fca.gg/hermes';

const ctx = Hermes.getContext('en-GB');
ctx.t('common.key'); // returns the value of the key in common.json
ctx.t('features.feature1.key'); // returns the value of the key in feature1.json
```

### Localized Objects
You can also get an object composed of all the translations for a specific key in all languages by using the `getLocalizedObject()` method. For example:
```typescript
import Hermes from '@fca.gg/hermes';

// This is only a definition of the LocalizedObject type
type LocalizedObject = Partial<
    [key: Langs]: string
> // AKA
type LocalizedObject = Partial<Record<Langs, string>>

const obj = Hermes.getLocalizedObject('key');
```

## License
This project is licensed under the AGPL v3 License - see the [LICENSE](LICENSE) file for details.

> We chose the AGPL to ensure that Hermes remains truly open source and contributive.
If you use or adapt Hermes, even over a network, you must share your modifications. That’s the spirit of the project — building useful tools together, in the open.
