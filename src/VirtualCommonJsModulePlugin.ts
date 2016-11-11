import * as CommonJsRequireDependency from 'webpack/lib/dependencies/CommonJsRequireDependency';

export interface VirtualCommonJsModulePluginOptions {
	moduleName: string;
	replaceModulePattern: string | RegExp;
	source: string;
}

export interface Matcher {
	(path: string): boolean;
}

function getRegExpMatcher(pattern: RegExp): Matcher {
	return function (path: string): boolean {
		return pattern.test(path);
	};
}

function getNameMatcher(name: string): Matcher {
	const length = name.length;
	return function (path: string): boolean {
		return path.lastIndexOf(name) === path.length - length;
	};
}

export default class VirtualCommonJsModulePlugin {
	protected _matcher: Matcher;

	moduleName: string;
	replaceModulePattern: string | RegExp;
	source: string;

	constructor(options: VirtualCommonJsModulePluginOptions) {
		this.moduleName = options.moduleName;
		this.replaceModulePattern = options.replaceModulePattern;
		this.source = options.source;

		this._matcher = typeof this.replaceModulePattern === 'string' ?
			getNameMatcher(this.replaceModulePattern) :
			getRegExpMatcher(this.replaceModulePattern);
	}

	apply(compiler: any) {
		compiler.plugin('compilation', () => {
			const fs = compiler.inputFileSystem;
			const matcher = this._matcher;
			const buffer = new Buffer(this.source);

			const stat = fs.stat;
			fs.stat = function (path: string, callback: Function) {
				if (matcher(path)) {
					return callback(null, {});
				}
				return stat.apply(fs, arguments);
			};

			const readFile = fs.readFile;
			fs.readFile = function (path: string, callback: Function) {
				if (matcher(path)) {
					return callback(null, buffer);
				}
				return readFile.apply(fs, arguments);
			};
		});

		compiler.parser.plugin('call require:commonjs:item', (expr: any, param: any) => {
			if (param.isString() && this._matcher(param.string)) {
				const dep = new CommonJsRequireDependency(this.moduleName, param.range);
				dep.loc = expr.loc;
				dep.optional = Boolean((<any> this).scope.inTry);
				(<any> this).state.current.addDependency(dep);
				return true;
			}
		});
	}
}
