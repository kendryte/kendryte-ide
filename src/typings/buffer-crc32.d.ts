declare module 'buffer-crc32' {
	interface crc32 {
		(input: Buffer, prev?: Buffer): Buffer;

		signed(input: Buffer): number;

		unsigned(input: Buffer): number;
	}

	const lib: crc32;
	export = lib;
}