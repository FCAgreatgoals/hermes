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

import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { HermesConfig } from './HermesConfig.js'
import { join, relative } from 'path'
import { Langs } from '../types/Langs.js'

export function flattenWithSource(obj: Record<string, any>, prefix = '', source = ''): Record<string, string> {
	let result: Record<string, string> = {}

	for (const key in obj) {
		const value = obj[key];
		const fullKey = prefix ? `${prefix}.${key}` : key;

		if (typeof value === 'object' && value !== null) {
			result = {
				...result,
				...flattenWithSource(value, fullKey, source)
			};
		} else {
			const namespacedKey = source ? `${source}:${fullKey}` : fullKey;
			result[namespacedKey] = String(value);
		}
	}

	return result;
}

export function collectLocales(config: HermesConfig): string[] {
	const entries = readdirSync(config.localesDir)
	const files: string[] = []

	for (const entry of entries) {
		const lang = entry.replace(/\.json$/, '');

		if (!Object.values(Langs).includes(lang as Langs))
			continue;

		files.push(lang);
	}

	return files;
}

export function readAllJsonFiles(dir: string): string[] {
	const results: string[] = [];
	const list = readdirSync(dir);

	for (const file of list) {
		const fullPath = join(dir, file);
		const stat = statSync(fullPath);

		if (stat && stat.isDirectory()) {
			results.push(...readAllJsonFiles(fullPath));
		} else if (file.endsWith('.json')) {
			results.push(fullPath);
		}
	}

	return results;
}

export function loadTranslations(locale: string, config: HermesConfig, visited = new Set<string>()): Record<string, any> {
	if (visited.has(locale)) return {};
	visited.add(locale);

	const filePath = join(config.localesDir, `${locale}.json`);
	const dirPath = join(config.localesDir, locale);

	let merged: Record<string, any> = {};

	if (existsSync(filePath)) {
		const content = JSON.parse(readFileSync(filePath, 'utf-8'));
		const flat = flattenWithSource(content);

		merged = {
			...merged,
			...flat
		};
	}

	if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
		const jsonFiles = readAllJsonFiles(dirPath);

		for (const fullPath of jsonFiles) {
			const relativePath = relative(dirPath, fullPath).replace(/\.json$/, '').replace(/\\/g, '/').replace(/\//g, '/');
			const content = JSON.parse(readFileSync(fullPath, 'utf-8'));
			const namespaced = flattenWithSource(content, '', relativePath);
			merged = {
				...merged,
				...namespaced
			};
		}
	}

	const localeFallbacks = config.fallbackChains[locale] || [];
	const defaultFallbacks = config.fallbackChains.default || [];

	const fallbacks = [
		...localeFallbacks,
		...defaultFallbacks.filter(lang => lang !== locale && !localeFallbacks.includes(lang))
	];

	for (const fallback of fallbacks) {
		const fallbackData = loadTranslations(fallback, config, visited);
		merged = {
			...fallbackData,
			...merged
		};
	}

	return merged;
}