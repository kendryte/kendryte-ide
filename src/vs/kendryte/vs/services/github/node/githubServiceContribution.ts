import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IHTTPConfiguration } from 'vs/platform/request/node/request';
import * as Octokit from '@octokit/rest';
import { getProxyAgent } from 'vs/base/node/proxy';
import { ILogService } from 'vs/platform/log/common/log';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { objectPath } from 'vs/kendryte/vs/base/common/objectPath';

export interface IGithubService {
	_serviceBrand: any;
	octokit: Octokit;
}

export const IGithubService = createDecorator<IGithubService>('githubService');

type XPath = { xpath: string };

function pathInvoke(self: object, parent: XPath | null, current: string, p: Thenable<void>): any {
	const xpath = parent ? parent.xpath + '.' + current : current;

	return new Proxy(Object.assign(() => void 0, { xpath }), {
		get(t: XPath, propKey: string) {
			return pathInvoke(self, t, propKey, p);
		},
		apply(t: XPath, thisArg: any, argArray?: any): any {
			return p.then(() => {
				console.log('call %s on self', t.xpath);
				return objectPath(self, t.xpath).apply(thisArg, argArray);
			});
		},
	});
}

class GithubService implements IGithubService {
	_serviceBrand: any;
	public readonly octokit: Octokit;

	constructor(
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@ILogService private readonly logService: ILogService,
	) {
		const p = this.configure();
		this.octokit = pathInvoke(this, null, 'octokit', p);
		p.catch(e => this.logService.error(e));

		configurationService.onDidChangeConfiguration(() => {
			this.configure().catch(e => this.logService.error(e));
		});
	}

	private async configure() {
		const config = this.configurationService.getValue<IHTTPConfiguration>();

		const baseUrl = 'https://api.github.com';

		const proxyUrl = config.http && config.http.proxy;
		const strictSSL = config.http && config.http.proxyStrictSSL;
		const authorization = config.http && config.http.proxyAuthorization;

		const agent = await getProxyAgent(baseUrl, { proxyUrl, strictSSL });

		const headers: { [header: string]: any } = {
			accept: 'application/vnd.github.v3+json',
			'user-agent': 'octokit/rest.js',
		};
		if (authorization) {
			Object.assign(headers, { 'Proxy-Authorization': authorization });
		}

		Object.assign(this, {
			octokit: new Octokit({
				timeout: 10 * 1000, // 0 means no request timeout
				headers,
				baseUrl,
				agent,
			}),
		});
	}
}

registerSingleton(IGithubService, GithubService);