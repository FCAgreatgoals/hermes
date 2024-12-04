# Hermes

Hermes is a lightweight and simple to use package for managing i18n strings for Node.js applications. It is designed to be modular and flexible, allowing you to split your translations into multiple files and directories, and to use a simple formatting syntax to insert variables into your strings.

## Installation

To install Hermes with npm, run:
```bash
npm install hermes-i18n
```

### Local usage
Clone the repository and run the following command to install the dependencies:
```bash
npm install
```

## Usage

### Initialization
In order to use Hermes, you will need to create a new directory to store your translations. Inside this directory, you can create as many JSON files as you like, each representing a different language. For example, you might have the following directory structure:

```
translations/
  en-US.json
  fr.json
  de.json
```
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
}
```
</details>

Each of these files should contain a JSON object with key-value pairs representing the translations for that language. For example, the contents of `en-US.json` might look like this:

```json
{
  "hello": "Hello World!",
  // You can also nest objects
  "nested": {
    "key": "This is a nested key"
  }
}
```

To initialize Hermes, you will need to import the `Hermes` class and call the `init()` method. This method can take an optional configuration object with the following properties:
- `translationsDir`: The path to the directory containing your translation files. Defaults to `./translations`.
- `noMissingTranslations`: Can be set to `warn`, `throw`, or `ignore`. Defaults to `warn`.
- `noEmptyTranslations`: Can be set to `warn`, `throw`, or `ignore`. Defaults to `warn`.

```typescript
import { Hermes } from 'hermes-i18n';

async function main() {
    await Hermes.init()
    // Do something with Hermes
}
main()
```

### Context
In order to get a translation, you need to fetch the specific context of a language. For example, if you want to get the translation for the `greeting` key in the `en-US` context, you would do the following:
```typescript
import { Hermes } from 'hermes-i18n';

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
import { Hermes } from 'hermes-i18n';

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
- `%value:switch(case:value)%`: Switch on the value of `value` and return the corresponding case. You can specify multiple cases separated by `|`.
  - `%value:switch(text value:This is a text value)`: If value is *"text value"*, return *"This is a text value"*.
  - `%value:switch(45:The value is 45)%`: If value is *45*, return *"The value is 45"*.
  - `%value:switch(45-60:The value is between 45 and 60)%`: If value is between *45* and *60* (exclusive), return *"The value is between 45 and 60"*. You can also put `-inf` or `inf` to match all values below or above a certain value. Inputting a `!` after a number will include that number in the range. For example, `45-60!` will include all numbers between 45 and 60, including 60.

## Scope
You can also define a scope for your translations by specifying it in the `getContext()` method. This allows you to group your translations by a specific context, such as a module or component name. For example:
```typescript
import { Hermes } from 'hermes-i18n';

const ctx = Hermes.getContext('en-US', 'nested');
ctx.t('key'); // returns "This is a nested key"
```

### Missing and Empty Translations
Hermes provides options for handling missing and empty translations. By default, Hermes will log a warning if a translation is missing or empty. You can change this behavior by setting the `noMissingTranslations` and `noEmptyTranslations` options in the `init()` method. For example:
```typescript
import { Hermes } from 'hermes-i18n';

async function main() {
    await Hermes.init({
        noMissingTranslations: 'throw',
        noEmptyTranslations: 'ignore'
    });
    // Do something with Hermes
}
main()
```

### Nesting files
You can also nest files in directories to group your translations. For example, you might have the following directory structure:
```
translations/
  en-US.json
  fr.json
  en-GB/
    common.json
    auth.json
    features/
      feature1.json
      feature2.json
```

In this case, you can access keys in the nested files by using dot notation:
```typescript
import { Hermes } from 'hermes-i18n';

const ctx = Hermes.getContext('en-GB');
ctx.t('common.key'); // returns the value of the key in common.json
ctx.t('features.feature1.key'); // returns the value of the key in feature1.json
```

### Localized Objects
You can also get an object composed of all the translations for a specific key in all languages by using the `getLocalizedObject()` method. For example:
```typescript
import { Hermes } from 'hermes-i18n';

// This is only a definition of the LocalizedObject type
type LocalizedObject = Partial<
    [key: Langs]: string
> // AKA
type LocalizedObject = Partial<Record<Langs, string>>

const obj = Hermes.getLocalizedObject('key');
```

## License
This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details.

