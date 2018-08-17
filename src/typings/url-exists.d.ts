declare module 'url-exists' {
	function urlExists(url: string, callback: (err: Error, exists: boolean) => void): void;

	export = urlExists;
}