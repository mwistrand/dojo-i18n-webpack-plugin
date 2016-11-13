// Generated by typings
// Source: https://raw.githubusercontent.com/mwistrand/DefinitelyTyped/72a852d18fe51b00441200641977a4051f304f3b/cldr-data/cldr-data.d.ts
interface CldrData {
	(path: string): Object;

	readonly availableLocales: string[];
	all: () => Object[];
	entireMainFor: (locale: string) => Object[];
	entireSupplemental: () => Object[];
}

declare let cldrData: CldrData;

declare module "cldr-data" {
	export = cldrData;
}
