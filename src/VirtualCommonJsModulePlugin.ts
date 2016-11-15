import * as CommonJsRequireDependency from 'webpack/lib/dependencies/CommonJsRequireDependency';

export interface Matcher {
	(path: string): boolean;
}

export interface VirtualCommonJsModulePluginOptions {
	moduleName: string;
	source: string;
}

function getNameMatcher(name: string): Matcher {
	const length = name.length;
	return function (path: string): boolean {
		const expected = path.length - length;
		return expected > -1 && path.lastIndexOf(name) === expected;
	};
}

function registerFactory(compilation: any, params: any) {
	compilation.dependencyFactories.set(CommonJsRequireDependency, params.normalModuleFactory);
	compilation.dependencyTemplates.set(CommonJsRequireDependency, new CommonJsRequireDependency.Template());
}

export default class VirtualCommonJsModulePlugin {
	protected _matcher: Matcher;

	moduleName: string;
	source: string;

	constructor(options: VirtualCommonJsModulePluginOptions) {
		this.moduleName = options.moduleName;
		this.source = options.source;

		this._matcher = getNameMatcher(this.moduleName);
	}

	apply(compiler: any) {
		const matcher = this._matcher;

		compiler.plugin('compilation', (compilation: any, params: any) => {
			registerFactory(compilation, params);

			const fs = compiler.inputFileSystem;
			const buffer = new Buffer(this.source);

			const stat = fs.stat;
			fs.stat = function (path: string, callback: Function) {
				if (matcher(path)) {
					return callback(null, {
						isDirectory() {
							return false;
						},
						isFile() {
							return true;
						}
					});
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

		const { moduleName } = this;
		compiler.parser.plugin('call require:commonjs:item', function (this: any, expr: any, param: any) {
			if (param.isString() && matcher(param.string)) {
				const dep = new CommonJsRequireDependency(moduleName, param.range);
				dep.loc = expr.loc;
				dep.optional = Boolean((<any> this).scope.inTry);
				(<any> this).state.current.addDependency(dep);
				return true;
			}
		});
	}
}
