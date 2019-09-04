export type ResponseObject = ResponseHello | ResponseWriteOk ;

export const enum ResponseType {
	Hello = 1,
	WriteOk = 2,
}

export interface ResponseHello {
	type: typeof ResponseType['Hello'];
	hello: 'Hello!';
}

export interface ResponseWriteOk {
	type: typeof ResponseType['WriteOk'];
	hash: string;
	chunk: number;
	address: number;
}

export function responseIsHello(json: ResponseObject): json is ResponseHello {
	return json.type === ResponseType.Hello;
}

export function responseIsWriteOk(json: ResponseObject): json is ResponseWriteOk {
	return json.type === ResponseType.WriteOk;
}

