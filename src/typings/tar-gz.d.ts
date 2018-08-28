declare module 'gunzip-maybe' {
	function gunzip(): NodeJS.ReadWriteStream;

	export = gunzip;
}
declare module 'tar-fs' {
	export function extract(path: string): NodeJS.ReadWriteStream;
}