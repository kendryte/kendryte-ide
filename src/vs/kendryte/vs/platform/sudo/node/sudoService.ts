import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { exec } from 'sudo-prompt';
import { isMacintosh } from 'vs/base/common/platform';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { dirname, join } from 'vs/base/common/path';
import product from 'vs/platform/product/common/product';

export interface Options {
	name?: string;
	icns?: string;
	logger?: {
		info: (message: string) => void;
		error: (message: string) => void;
	}
}

export interface Result {
	stdout: string;
	stderr: string;
}

export interface ISudoService {
	_serviceBrand: any;
	exec(cmd: string, options?: Options): Promise<Result>;
}

export const ISudoService = createDecorator<ISudoService>('sudoService');

export class SudoService implements ISudoService {
	_serviceBrand: any;
	private readonly defaultTitle: string;
	private readonly defaultICNS?: string;

	constructor(
		@IEnvironmentService private readonly environmentService: IEnvironmentService,
	) {
		this.defaultTitle = 'KendryteIDEWorkerProcess';
		if (isMacintosh && this.environmentService.isBuilt) {
			this.defaultICNS = join(dirname(this.environmentService.appRoot), `${product.nameShort}.icns`);
		}
	}

	exec(cmd: string, options: Options = {}): Promise<Result> {
		if (!options.name) {
			options.name = this.defaultTitle;
		}
		if (!options.icns) {
			options.icns = this.defaultICNS;
		}

		const logger = options.logger || console;

		logger.info('Run command with sudo: ' + cmd);
		return new Promise((resolve, reject) => {
			exec(cmd, options, (error, stdout, stderr) => {
				if (error) {
					logger.error('Command failed:\n Error: ' + error);
					reject(new Error(error));
				} else {
					logger.info('Command return:\nstdout: (' + stdout.length + ' characters)\n' + stdout.trim() + '\nstderr: (' + stderr.length + ' characters)\n' + stderr.trim());

					resolve({ stdout, stderr });
				}
			});
		});
	}
}
