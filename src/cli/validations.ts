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

import { existsSync, readFileSync, statSync } from 'fs'
import { join, relative } from 'path'
import { Langs } from '../types/Langs'
import { HermesConfig } from './HermesConfig'
import { flattenWithSource, readAllJsonFiles } from './utils'

export function validateTranslations(allTranslations: Record<Langs, Record<string, string>>) {
	const langs = Object.keys(allTranslations) as Langs[]

	const missing: Record<Langs, Set<string>> = {} as any
	const empty: Record<Langs, Set<string>> = {} as any

	for (const lang of langs) {
		const current = allTranslations[lang]

		if (!missing[lang])
			missing[lang] = new Set<string>()
		if (!empty[lang])
			empty[lang] = new Set<string>()

		for (const key of Object.keys(current)) {
			if (
				current[key] === '' ||
				current[key] === null ||
				current[key] === undefined
			) {
				empty[lang].add(key)
			}

			for (const otherLang of langs) {
				if (otherLang === lang)
					continue

				if (!(key in allTranslations[otherLang])) {
					if (!missing[otherLang])
						missing[otherLang] = new Set<string>()

					if (!empty[otherLang])
						empty[otherLang] = new Set<string>()

					missing[otherLang].add(key)
				}
			}
		}
	}

	const missingCount = langs.reduce((acc, l) => acc + missing[l].size, 0)
	const emptyCount = langs.reduce((acc, l) => acc + empty[l].size, 0)

	if (missingCount > 0) {
		console.warn('[i18n] Missing translations:')
		for (const lang of langs) {
			if (missing[lang].size > 0) {
				console.warn(`- ${lang}: ${missing[lang].size} missing:`)
				for (const key of missing[lang]) console.warn(`  - ${key}`)
			}
		}
	}

	if (emptyCount > 0) {
		console.warn('[i18n] Empty translations:')
		for (const lang of langs) {
			if (empty[lang].size > 0) {
				console.warn(`- ${lang}: ${empty[lang].size} empty:`)
				for (const key of empty[lang]) console.warn(`  - ${key}`)
			}
		}
	}
}

export function loadTranslationsRaw(locale: string, config: HermesConfig): Record<string, string> {
	const filePath = join(config.localesDir, `${locale}.json`)
	const dirPath = join(config.localesDir, locale)

	let merged: Record<string, string> = {}

	if (existsSync(filePath)) {
		const content = JSON.parse(readFileSync(filePath, 'utf-8'))
		const flat = flattenWithSource(content)
		merged = { ...merged, ...flat }
	}

	if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
		const jsonFiles = readAllJsonFiles(dirPath)

		for (const fullPath of jsonFiles) {
			const relativePath = relative(dirPath, fullPath)
				.replace(/\.json$/, '')
				.replace(/\\/g, '/')
			const content = JSON.parse(readFileSync(fullPath, 'utf-8'))
			const namespaced = flattenWithSource(content, '', relativePath)
			merged = { ...merged, ...namespaced }
		}
	}

	return merged
}
