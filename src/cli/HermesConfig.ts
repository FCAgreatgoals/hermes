/**
 * This file is part of Hermes (https://github.com/FCAgreatgoals/hermes).
 *
 * Copyright (C) 2025 SAS French Community Agency
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { resolve } from 'path';
import { Langs } from '../types/Langs.js';
import { existsSync } from 'fs';

export interface HermesConfig {
	localesDir: string
	buildDir: string
	checkTranslations: boolean
	fallbackChains: Record<string, string[]>
}

export const DEFAULT_CONFIG: HermesConfig = {
	localesDir: 'locales',
	buildDir: '.hermes',
	checkTranslations: true,
	fallbackChains: {
		/* [Langs.INDONESIAN]: [Langs.ENGLISH_US, Langs.ENGLISH_UK], */
		[Langs.DANISH]: [Langs.SWEDISH, Langs.NORWEGIAN],
		/* [Langs.GERMAN]: [Langs.ENGLISH_US, Langs.ENGLISH_UK], */
		[Langs.ENGLISH_UK]: [Langs.ENGLISH_US, Langs.FRENCH],
		[Langs.ENGLISH_US]: [Langs.ENGLISH_UK, Langs.SPANISH],
		[Langs.SPANISH]: [Langs.SPANISH_LATAM, Langs.BRAZILIAN_PORTUGUESE],
		[Langs.SPANISH_LATAM]: [Langs.SPANISH, Langs.BRAZILIAN_PORTUGUESE],
		/* [Langs.FRENCH]: [Langs.ENGLISH_US, Langs.ENGLISH_UK], */
		[Langs.CROATIAN]: [Langs.POLISH, Langs.CZECH],
		[Langs.ITALIAN]: [Langs.SPANISH, Langs.FRENCH],
		[Langs.LITHUANIAN]: [Langs.POLISH, Langs.RUSSIAN],
		[Langs.HUNGARIAN]: [Langs.ROMANIAN, Langs.POLISH],
		[Langs.DUTCH]: [Langs.ENGLISH_US, Langs.ENGLISH_UK, Langs.GERMAN],
		[Langs.NORWEGIAN]: [Langs.SWEDISH, Langs.DANISH],
		[Langs.POLISH]: [Langs.UKRAINIAN, Langs.RUSSIAN],
		[Langs.BRAZILIAN_PORTUGUESE]: [Langs.SPANISH_LATAM, Langs.SPANISH],
		/* [Langs.ROMANIAN]: [Langs.ENGLISH_US, Langs.ENGLISH_UK], */
		[Langs.FINNISH]: [Langs.SWEDISH],
		[Langs.SWEDISH]: [Langs.NORWEGIAN, Langs.DANISH],
		/* [Langs.VIETNAMESE]: [Langs.ENGLISH_US, Langs.ENGLISH_UK],
		[Langs.TURKISH]: [Langs.ENGLISH_US, Langs.ENGLISH_UK], */
		[Langs.CZECH]: [Langs.POLISH, Langs.GERMAN],
		[Langs.GREEK]: [Langs.ENGLISH_US, Langs.ENGLISH_UK, Langs.ITALIAN],
		[Langs.BULGARIAN]: [Langs.RUSSIAN],
		[Langs.RUSSIAN]: [Langs.UKRAINIAN],
		[Langs.UKRAINIAN]: [Langs.RUSSIAN],
		/* [Langs.HINDI]: [Langs.ENGLISH_US, Langs.ENGLISH_UK],
		[Langs.THAI]: [Langs.ENGLISH_US, Langs.ENGLISH_UK], */
		[Langs.CHINESE_CHINA]: [Langs.CHINESE_TAIWAN],
		/* [Langs.JAPANESE]: [Langs.ENGLISH_US, Langs.ENGLISH_UK, Langs.CHINESE_CHINA], */
		[Langs.CHINESE_TAIWAN]: [Langs.CHINESE_CHINA],
		/* [Langs.KOREAN]: [Langs.ENGLISH_US, Langs.ENGLISH_UK, Langs.JAPANESE], */
		default: [Langs.ENGLISH_US, Langs.ENGLISH_UK]
	}
};

export async function loadHermesConfig(): Promise<HermesConfig> {
	const configPath = resolve('hermes.config.js');
	if (existsSync(configPath)) {
		const config = (await import(configPath)).default as Partial<HermesConfig>;

		return {
			localesDir: config.localesDir || DEFAULT_CONFIG.localesDir,
			buildDir: config.buildDir || DEFAULT_CONFIG.buildDir,
			checkTranslations: config.checkTranslations || DEFAULT_CONFIG.checkTranslations,
			fallbackChains: {
				...DEFAULT_CONFIG.fallbackChains,
				...config.fallbackChains
			}
		};
	}
	return DEFAULT_CONFIG;
}
