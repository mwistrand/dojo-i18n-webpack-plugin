import * as loadCldrData from 'cldr-data';
import * as path from 'path';
import I18nPlugin from './main';
import { CldrData } from 'dojo-i18n/cldr/load';

const localeCldrFiles = [ 'numbers', 'currencies', 'ca-gregorian', 'timeZoneNames', 'dateFields', 'units' ];
const supplementalCldrFiles = [ 'likelySubtags', 'numberingSystems', 'plurals', 'ordinals', 'currencyData', 'timeData', 'weekData' ];
const supplementalCldrData = supplementalCldrFiles.map((file: string): CldrData => {
	return loadCldrData(path.join('supplemental', file));
});

interface LocaleCldrMap {
	[locale: string]: CldrData[];
}

export default function loadTemplate(plugin: I18nPlugin): string {
	const { developmentLocale, isProduction, supportedLocales } = plugin;
	const locales = supportedLocales.slice();
	const rootLocale = isProduction ? '' : developmentLocale;

	if (rootLocale && locales.indexOf(rootLocale) === -1) {
		locales.push(developmentLocale);
	}

	const localeCldrData = locales.reduce((data: LocaleCldrMap, locale: string): LocaleCldrMap => {
		data[locale] = localeCldrFiles.map((file: string): CldrData => {
			return loadCldrData(path.join('main', locale, file));
		});
		return data;
	}, {} as LocaleCldrMap);

	return `var loadCldrData = require('dojo-i18n/cldr/load');
		var i18n = require('dojo-i18n/i18n');
		var Promise = require('dojo-shim/Promise');
		var Globalize = require('globalize');

		var supplementalCldrData = ${supplementalCldrData};
		var localeCldrData = ${localeCldrData};

		Globalize.load(supplementalCldrData);
		Globalize.load(localeCldrData);
		Globalize.locale(${rootLocale} || i18n.systemLocale);

		module.exports = function (locales) {
			if (Array.isArray(locales)) {
				var toLoad = [];
				var loaded = {};
				locales.forEach(function (locale) {
					var data = localeCldrData[locale];

					if (data) {
						loaded[locale] = data;
					}
					else {
						toLoad.push(locale);
					}
				});

				if (toLoad.length) {
					return loadCldrData(toLoad).then(function (data) {
						return locales.reduce(function (result, locale) {
							var cldrData = loaded[locale] || data[toLoad.indexOf(locale)];
							result[locales.indexOf(locale)] = cldrData;
							return result;
						}, []);
					});
				}
			}
			else {
				var fallback = arguments[1];
				var data = localeCldrData[locale] || localeCldrData[fallback];
				return data ? Promise.default.resolve([ data ]) : loadCldrData(locales, fallback);
			}
		};`;
}
