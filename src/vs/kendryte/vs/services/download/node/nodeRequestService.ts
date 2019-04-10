import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { assign } from 'vs/base/common/objects';
import { getProxyAgent } from 'vs/base/node/proxy';
import { IHTTPConfiguration } from 'vs/platform/request/node/request';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import request = require('request');

export const INodeRequestService = createDecorator<INodeRequestService>('INodeRequestService');

export interface Headers extends request.Headers {

}

export interface INodeRequestService {
	_serviceBrand: any;

	getBody(url: string): Promise<string>;

	raw(method: string, url: string, headers?: Headers): Promise<request.Request>;
}

class NodeRequestService implements INodeRequestService {
	_serviceBrand: any;
	private defaultHeaders: object = {
		'user-agent': 'maix-ide, Visual Studio Code, Chrome',
	};

	constructor(
		@IConfigurationService private configurationService: IConfigurationService,
	) {

	}

	getBody(url: string): Promise<string> {
		return this.raw('GET', url).then((req) => {
			return new Promise((resolve, reject) => {
				req.on('error', (error) => {
					reject(error);
				});
				let body = '';
				req.on('data', (p) => {
					body += p;
				});
				req.on('complete', (data) => {
					resolve(body as string);
				});
				req.on('error', (error) => {
					reject(error);
				});
			});
		});
	}

	async raw(method: string, url: string, headers: request.Headers = {}): Promise<request.Request> {
		const options: request.OptionsWithUrl = {
			json: false,
			url,
			headers: assign(headers, this.defaultHeaders),
		};

		const config: IHTTPConfiguration = this.configurationService.getValue<IHTTPConfiguration>();

		const proxyUrl = config.http && config.http.proxy;
		const strictSSL = config.http && config.http.proxyStrictSSL;
		const authorization = config.http && config.http.proxyAuthorization;
		// this.logger.info('proxyUrl=%s', proxyUrl);
		// this.logger.info('strictSSL=%s', strictSSL);

		if (authorization) {
			assign(headers, { 'Proxy-Authorization': authorization });
		}

		const agent = await getProxyAgent(options.url as string, { proxyUrl, strictSSL });

		assign(options, {
			agent,
			strictSSL,
			followAllRedirects: true,
		});

		return request(options);
	}
}

registerSingleton(INodeRequestService, NodeRequestService);