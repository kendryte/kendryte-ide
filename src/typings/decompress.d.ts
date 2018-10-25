declare module 'decompress' {
	// Type definitions for decompress 4.2
	// Project: https://github.com/kevva/decompress#readme
	// Definitions by: York Yao <https://github.com/plantain-00>
	//                 Jesse Bethke <https://github.com/jbethke>
	// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

	export = decompress;

	function decompress(input: string | Buffer, output?: string | decompress.DecompressOptions, opts?: decompress.DecompressOptions): Promise<decompress.File[]>;

	namespace decompress {
		interface File {
			data: Buffer;
			mode: number;
			mtime: string;
			path: string;
			type: string;
		}

		interface DecompressOptions {
			/**
			 * Filter out files before extracting
			 */
			filter?(file: File): boolean;
			/**
			 * Map files before extracting
			 */
			map?(file: File): File;
			/**
			 * Array of plugins to use.
			 * Default: [decompressTar(), decompressTarbz2(), decompressTargz(), decompressUnzip()]
			 */
			plugins?: any[];
			/**
			 * Remove leading directory components from extracted files.
			 * Default: 0
			 */
			strip?: number;
		}
	}
}

declare module 'decompress-tar' {
	function decompressTar(): any;

	export = decompressTar;
}

declare module 'decompress-tarbz2' {
	function decompressTarbz2(): any;

	export = decompressTarbz2;
}

declare module 'decompress-targz' {
	function decompressTargz(): any;

	export = decompressTargz;
}

declare module 'decompress-tarxz' {
	function decompressTarxz(): any;

	export = decompressTarxz;
}
