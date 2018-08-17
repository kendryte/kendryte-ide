declare module 'request-progress' {
	import { Stream } from 'stream';
	import { Request } from 'request';

	function RequestProcess(request: Request, options: any): Stream;

	export = RequestProcess;
}