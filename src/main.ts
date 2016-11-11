/* tslint:disable:interface-name */
import { systemLocale } from 'dojo-i18n/i18n';
import loadTemplate from './loadTemplate';
import VirtualCommonJsModulePlugin from './VirtualCommonJsModulePlugin';

export interface I18nPluginOptions {
	developmentLocale?: string;
	i18nModuleId?: string;
	isProduction?: boolean;
	supportedLocales: string[];
}

export default class I18nPlugin {
	developmentLocale: string;
	i18nModuleId: string;
	isProduction: boolean;
	supportedLocales: string[];

	constructor(options: I18nPluginOptions) {
		this.developmentLocale = options.developmentLocale || systemLocale;
		this.i18nModuleId = options.i18nModuleId || 'dojo-i18n';
		this.isProduction = options.isProduction || false;
		this.supportedLocales = options.supportedLocales;
	}

	apply(compiler: any) {
		compiler.apply(new VirtualCommonJsModulePlugin({
			moduleName: `${this.i18nModuleId}-build/cldr/load`,
			replaceModulePattern: `${this.i18nModuleId}/cldr/load`,
			source: loadTemplate(this)
		}));
	}
}
